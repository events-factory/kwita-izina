$(document).ready(function () {
  let progress_submit = false;
  initializeForm();
});
var paymentAmount = 0;
currentLanguage = 'en';
function initializeForm() {
  $('.loading-overlay').addClass('is-active');
  let xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    $('.loading-overlay').removeClass('is-active');
    if (this.readyState === 4 && this.status === 200) {
      let res = JSON.parse(xhr.response);
      description =
        currentLanguage == 'en'
          ? res.about.english_description
          : res.about.french_description;

      attendance_text =
        currentLanguage == 'en'
          ? 'Select your attendance type'
          : 'Sélectionnez votre type de présence';
      physical_text =
        currentLanguage == 'en' ? 'Physical Attendance' : 'Présence physique';
      physical_desc =
        currentLanguage === 'en'
          ? 'By selecting this, you agree to be present at the event venue.'
          : "En le sélectionnant, vous acceptez d'être présent sur le lieu de l'événement.";
      select_button = currentLanguage === 'en' ? 'Select' : 'sélectionner';
      virtual_text =
        currentLanguage === 'en'
          ? 'By selecting this you can only attend the event online.'
          : "En sélectionnant cette option, vous ne pouvez assister à l'événement qu'en ligne.";
      virtual_desc =
        currentLanguage === 'en' ? 'Virtual Attendance' : 'Présence virtuelle';

      if (res.event_description.event_type === 'HYBRID') {
        $('#registration-form').html(`
          <h4 class="text-center">${attendance_text}</h4>
          <div class="col-sm-6">
              <div class="card">
                  <div class="card-body text-center py-5">
                      <h5 class="card-title">${physical_text}</h5>
                      <p class="card-text">
                          ${physical_desc}
                      </p>
                      <button onclick="getCategories('PHYSICAL')" type="button" class="searchBoxToggler vs-btn style2 py-3">
                          ${select_button}
                      </button>
                  </div>
              </div>
          </div>
          <div class="col-sm-6">
              <div class="card">
                  <div class="card-body text-center py-5">
                      <h5 class="card-title">${virtual_desc}</h5>
                      <p class="card-text">
                      ${virtual_text}
                      </p>
                      <button onclick="getCategories('VIRTUAL')" type="button" class="searchBoxToggler vs-btn style2 py-3">
                            ${select_button}
                      </button>
                  </div>
              </div>
          </div>
        `);
      } else {
        displayForm(category_code_id);
      }
    }
  });
  xhr.open('GET', `${request_host}/Api/Registration-Page-Api`);
  xhr.setRequestHeader('Authorization', event_code);
  xhr.send();
}

function getCategories(event_type) {
  $('.loader').fadeIn();
  $('.loader-overlay').fadeIn('slow');

  closingreg_text =
    currentLanguage === 'en'
      ? 'Registrations close on'
      : 'Clôture des inscriptions';

  earlybird_text =
    currentLanguage === 'en'
      ? 'Early bird registration ends on'
      : "L'inscription hâtive se termine le";

  let data = new FormData();
  data.append('event_code', event_code);
  data.append('attendence', event_type);
  data.append('operation', 'get-categories');

  let xhr = new XMLHttpRequest();
  register_btn = 'Register';

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === 4 && this.status === 200) {
      $('.loader').fadeOut();
      $('.loader-overlay').fadeOut('slow');
      let res = JSON.parse(xhr.response);

      $('#registration-form').html('');
      $('#attendence_type').val(event_type);

      res.data.forEach((element) => {
        if (element.id !== 55) {
          let category_name =
            currentLanguage === 'en'
              ? element.name_english
              : element.name_french;

          $('#registration-form').append(`
            <div class="col-lg-3 col-md-6 mb-4">
                  <div class="card h-100 text-center border">
                    <div class="card-body">
                      <p class="category-text mt-2">
                        Category D
                      </p>
                      <h5 class="card-title text-primary">${element.name_english}</h5>
                      
                      <p class="card-text mt-2">
                        <ul class="category-list px-2">
                          <li>Persons who are not paid up members of EALS can attend the conference on payment of $400.</li>
                        </ul>
                      </p>
                    </div>
                    <div class="card-footer">
                      <button class="btn register-btn " type="button" onclick="displayForm(${element.id})">Register</button>
                    </div>
                  </div>
                </div>
          `);
        }
      });
    }
  });

  xhr.open('POST', `${request_host}/Api/Display-Registration-Categories`);
  xhr.send(data);
}

function displayForm(category_id) {
  $('.loader').fadeIn();
  $('.loader-overlay').fadeIn('slow');
  localStorage.setItem('category_id', category_id);
  let data = new FormData();
  data.append('category', category_id);
  data.append('attendence', $('#attendence_type').val());
  data.append('event_code', event_code);
  data.append('operation', 'get-form-inputs');
  let xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    apply_as = currentLanguage == 'en' ? 'Apply as' : 'Appliquer en tant que';
    ticket_fee_text =
      currentLanguage == 'en' ? 'the ticket fee  is' : 'le prix du billet est';
    if (this.readyState === 4 && this.status === 200) {
      $('.loader').fadeOut();
      $('.loader-overlay').fadeOut('slow');
      let res = JSON.parse(xhr.response);
      paymentAmount = parseFloat(res.category.fee.split(' ')[1]);
      localStorage.setItem('paymentAmount', paymentAmount);

      $('#registration-form').html('');
      $('#registration-form').addClass(
        res.category.form_type == 'SINGLE' ? 'single-step' : 'multi-step'
      );

      $('#registration-form').append(`
        <h1 class="mt-5">Registration Form</h1>
        <input type="hidden" id="payment_token" value="">
        <input type="hidden" id="payment_session" value="">
        <input type="hidden" id="order_id" value="">
        <input type="hidden" id="acknowleadgment" value="">
      `);
      res.data.forEach((element) => {
        group_name =
          currentLanguage == 'en'
            ? element.group.name
            : element.group.nameFrench;
        let groupInputs = '';
        element.inputs.forEach((FormData) => {
          groupInputs += inputUI(FormData);
          console.log(groupInputs);
        });
        $('#ticket_id').val(category_id);
        $('#registration-form').append(`
          <filedset class="col-lg-12 col-md-12 mx-auto d-flex flex-wrap">  
            <legend class="w-100">${group_name}</legend>
            ${groupInputs}
          </filedset>
          
        `);
      });

      if ($('#registration-form').hasClass('multi-step')) {
        let stepsCount = $('#registration-form').children('filedset').length;

        $('#registration-form')
          .children('filedset')
          .each(function (element) {
            $(this).attr('data-registration-step', element);
            $(this).addClass('registration-step');
            $(this)
              .children('legend')
              .append(
                `<span class="step-number">[${
                  element + 1
                }/${stepsCount}]</span>`
              );
            if (element !== 0) {
              $(this).addClass('d-none');
            }

            if (element === stepsCount - 1) {
              $(this).append(`
              <div class="col-lg-12 col-md-12 mx-auto place-order d-flex justify-content-between">
                <button type="button" class="vs-btn" onclick="prevStep(${element})">Previous</button>
                  <button  id="register_delegates" type="submit" class="btn register-btn vs-btn">Register</button>
              </div>
            `);
            } else if (element === 0) {
              $(this).append(`
              <div class="col-lg-12 col-md-12 mx-auto place-order d-flex justify-content-start">
                  <button type="button" class="vs-btn btn register-btn " onclick="nextStep(${element})">Next</button>
              </div>
            `);
            } else {
              $(this).append(`
              <div class="col-lg-12 col-md-12 mx-auto place-order d-flex justify-content-between">
                  <button type="button" class="vs-btn btn register-btn" onclick="prevStep(${element})">Previous</button>
                  <button type="button" class="vs-btn btn register-btn" onclick="nextStep(${element})">Next</button>
              </div>
            `);
            }
          });
      } else {
        $('#registration-form').append(`
            <div class="col-lg-8 col-md-8 mx-auto mb-4 place-order" id="register_delegates">
                <button type="submit" class="vs-btn btn register-btn w-100" onclick="callPaymentUI()">Register</button>
            </div>
          `);
      }

      if (res.category.is_free == 'YES') {
        $('#register_delegates').css('display', 'block');
      }

      // Remove any existing Select2 containers to avoid double-initialization
      $('select.form-control').each(function () {
        if ($(this).hasClass('select2-hidden-accessible')) {
          $(this).select2('destroy');
        }
      });
      // Re-initialize Select2 for all select fields after rendering
      setTimeout(function () {
        $('select.form-control').each(function () {
          $(this).select2({
            minimumInputLength: 0,
            width: '100%',
            dropdownAutoWidth: true,
          });
        });
      }, 0);

      $('#file-input_id_1729321993').parent().addClass('d-none');

      $('#input_id_1729166628').on('change', function () {
        if ($(this).val() !== null && $(this).val() !== '') {
          localStorage.setItem('payment_method', $(this).val());
        }

        if ($(this).val() === 'Bank Transfer') {
          $('#file-input_id_1729321993').parent().removeClass('d-none');
        } else {
          $('#file-input_id_1729321993').parent().addClass('d-none');
        }
      });

      $('#input_id_75031').on('change', function () {
        if ($(this).val() !== null && $(this).val() !== '') {
          $('#notification-image').attr('src', 'assets/img/payment.gif');
          $('#message-header').text('Authenticating Payment Request...');
          $('#message-description').text(
            'Authentication in progress. We are currently verifying and validating your payment request to ensure its authenticity and security.'
          );
          $('#closing_modal').hide();
          $('#staticBackdrop').modal('show');
          $('#payment_action_name').html('');
          let data = getFormInputData();
          data.append('payment_method', $(this).val());
          data.append('event_code', event_code);
          data.append('appication_id', 'Registration');
          var xhr = new XMLHttpRequest();
          xhr.withCredentials = true;
          xhr.addEventListener('readystatechange', function () {
            if (this.readyState === 4) {
              $('.loader').fadeOut();
              $('.loader-overlay').fadeOut('slow');
              let res = JSON.parse(this.responseText);
              switch (this.status) {
                case 200:
                  if (res.data.result == true) {
                    $('#notification-image').attr(
                      'src',
                      'assets/img/accepted-payment.gif'
                    );
                    $('#message-header').text('Payment Request Accepted');
                    if (res.data.direct_payment == 'true') {
                      $('#message-description').text(
                        'Your payment request has been accepted, please make sure you filled all the required fields correctly before procceeding. You will be redirected to our payment portal to complete your payment.'
                      );
                      $('#payment_action_name').html(`
                        <button type="button" id="closing_modal" onclick="resetPayment()" class="searchBoxToggler vs-btn style2" data-bs-dismiss="modal">Edit</button>
                        <button type="button" onclick="callPaymentUI()" class="searchBoxToggler vs-btn style2" >Pay Now</button>
                      `);
                    } else {
                      $('#order_id').val('');
                      $('#message-description').text(
                        'Your payment request has been accepted, the information about our bank account will be sent to your email address. Please make sure you filled all the required fields correctly before procceeding.'
                      );
                      $('#payment_action_name').html(`
                        <button type="button" id="closing_modal" onclick="resetPayment()" class="searchBoxToggler vs-btn style2" data-bs-dismiss="modal">Edit</button>
                        <button type="button" onclick="submitForm()" class="searchBoxToggler vs-btn style2" data-bs-dismiss="modal">Continue</button>
                      `);
                    }
                  } else {
                    $('#notification-image').attr(
                      'src',
                      'assets/img/payment-failed-error.gif'
                    );
                    $('#message-header').text(
                      'We currently do not accept this payment method'
                    );
                  }
                  break;
                case 400:
                  if (!Array.isArray(res.message)) {
                    $('#notification-image').attr(
                      'src',
                      'assets/img/payment-failed-error.gif'
                    );
                    $('#message-header').text(
                      'We currently do not accept this payment method'
                    );
                    $('#message-description').text(
                      'We do not currently accept this payment method. Please choose an alternative payment method during checkout.'
                    );
                    $('#payment_action_name').html(`
                      <button type="button" id="closing_modal" onclick="resetPayment()" class="searchBoxToggler vs-btn style2 col-12" data-bs-dismiss="modal">Try another method</button>
                    `);
                  } else {
                    $('#notification-image').attr(
                      'src',
                      'assets/img/validation.gif'
                    );
                    $('#message-header').text('Validation Error');
                    $('#message-description').text(
                      'Kindly check the following errors and try again.'
                    );
                    $('#payment_action_name').html(`
                      <button type="button" id="closing_modal" onclick="resetPayment()" class="searchBoxToggler vs-btn style2 col-12" data-bs-dismiss="modal">Edit</button>
                    `);
                    displayErrors(JSON.parse(this.responseText));
                  }
                  break;
              }
            }
          });
          xhr.open('POST', `${request_host}/Api/Validate-Payment-Method`);
          xhr.send(data);
        }
      });

      $('.form-control').on('blur', function () {
        if ($(this).val() !== null && $(this).val().length > 0) {
          $(this).is('select') && $(this).select2('close');
          $(this).addClass('has-value text-dark');
        } else {
          $(this).is('select') && $(this).select2('open');
          $(this).removeClass('has-value');
        }
      });
      $('select').on('select2:open', function () {
        $('.select2-search__field').attr('placeholder', 'Search');
        $(this).siblings('.select-labels').addClass('select-labels-active');
      });
      $('select').on('select2:close', function () {
        if ($(this).val() === null || $(this).val() === '') {
          $('.select-labels').removeClass('select-labels-active');
        }
      });
      $('input[type="date"]').pickadate({
        weekdaysShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        showMonthsShort: true,
        min: new Date(),
        onOpen: function () {
          const id = $(this)[0]['$node'][0].id;
          $(`#${id}`)
            .siblings('.select-labels')
            .addClass('select-labels-active');
        },
        onClose: function () {
          const id = $(this)[0]['$node'][0].id;
          if ($(`#${id}`).val() === '') {
            $(`#${id}`)
              .siblings('.select-labels')
              .removeClass('select-labels-active');
          }
        },
      });
      $('input[type="time"]').pickatime({
        format: 'HH:i',
        interval: 15,
        onOpen: function () {
          const id = $(this)[0]['$node'][0].id;
          $(`#${id}`)
            .siblings('.select-labels')
            .addClass('select-labels-active');
        },
        onClose: function () {
          const id = $(this)[0]['$node'][0].id;
          if ($(`#${id}`).val() === '') {
            $(`#${id}`)
              .siblings('.select-labels')
              .removeClass('select-labels-active');
          }
        },
      });
      $('input[type="number"]').on('input', function () {
        let filteredValue = $(this)
          .val()
          .replace(/[^0-9]/g, '');
        $(this).val(filteredValue);
      });
      // Remove any existing intlTelInput instances to avoid double-initialization
      setTimeout(function () {
        let phone_inputs = document.querySelectorAll("input[type='tel']");
        phone_inputs.forEach(function (phone_input) {
          if (
            phone_input.parentElement &&
            phone_input.parentElement.classList.contains('intl-tel-input')
          ) {
            // Remove the intl-tel-input wrapper if it exists (reset field)
            let clone = phone_input.cloneNode(true);
            phone_input.parentElement.replaceWith(clone);
            phone_input = clone;
          }
          window.intlTelInput(phone_input, {
            initialCountry: 'us',
            preferredCountries: ['us', 'gb', 'fr'],
            separateDialCode: true,
            placeholderNumberType: 'FIXED_LINE',
            nationalMode: true,
            customPlaceholder: function () {
              return '';
            },
            formatOnDisplay: true,
            utilsScript: 'assets/intelinpt/js/utils.js',
          });
          phone_input.addEventListener('focus', function () {
            phone_input.style.paddingLeft = '95px';
            $('.phone-label').addClass('focused-label');
          });
          phone_input.addEventListener('blur', function () {
            if (phone_input.value == '') {
              $('.phone-label').removeClass('focused-label');
            }
          });
          phone_input.addEventListener('input', function () {
            let filteredValue = phone_input.value.replace(/[^0-9]/g, '');
            phone_input.style.paddingLeft = '95px';
            if (filteredValue.length > 18) {
              filteredValue = filteredValue.slice(0, 18);
            }
            phone_input.value = filteredValue;
          });
        });
      }, 0);
      setTimeout(() => {
        // initialize_payment();
      }, 1500);
    }
  });
  xhr.open('POST', `${request_host}/Api/Display-Categories-Form-Inputs`);
  xhr.send(data);
}

function initialize_payment(update_session = false) {
  let data = new FormData();
  data.append('category', $('#ticket_id').val());
  data.append('attendence', $('#attendence_type').val());
  data.append('event_code', event_code);
  data.append('application', 'registration');
  let payment_data = new XMLHttpRequest();
  payment_data.addEventListener('readystatechange', function () {
    if (this.readyState === 4) {
      let res = JSON.parse(this.responseText);
      switch (this.status) {
        case 200:
          if (res.data.result === 'SUCCESS') {
            $('#payment_token').val(res.data.token);
            $('#payment_session').val(res.data.payment_session);
            $('#order_id').val(res.data.orderId);
            if (update_session) {
              callPaymentUI();
            }
          } else {
            $('#notification-image').attr(
              'src',
              'assets/img/website-maintenance.gif'
            );
            $('#message-header').text('Online Payment Portal Unreachable');
            $('#message-description').text(
              'We are sorry for the inconvenience, our payment gataway is unreachable at the moment, please try again later.'
            );
            $('#staticBackdrop').modal('show');
            $('#payment_action_name').html(
              `<button type="button" id="closing_modal" class="searchBoxToggler vs-btn style2 col-12" data-bs-dismiss="modal">Close</button>`
            );
          }
          break;
        default:
          $('#notification-image').attr(
            'src',
            'assets/img/website-maintenance.gif'
          );
          $('#message-header').text('Online Payment Portal Unreachable');
          $('#message-description').text(
            'We are sorry for the inconvenience, our payment gataway is unreachable at the moment, please try again later.'
          );
          $('#staticBackdrop').modal('show');
          $('#payment_action_name').html(
            `<button type="button" id="closing_modal" class="searchBoxToggler vs-btn style2 col-12" data-bs-dismiss="modal">Close</button>`
          );
          break;
      }
    }
  });
  payment_data.open(
    'POST',
    `${request_host}/Api/Initiate-Gateway-Session`,
    true
  );
  payment_data.send(data);
}

function nextStep(currentStep) {
  let nextStep = currentStep + 1;
  $(`.registration-step[data-registration-step="${currentStep}"]`).addClass(
    'd-none'
  );
  $(`.registration-step[data-registration-step="${nextStep}"]`).removeClass(
    'd-none'
  );
}

function prevStep(currentStep) {
  let previousStep = currentStep - 1;
  $(`.registration-step[data-registration-step="${currentStep}"]`).addClass(
    'd-none'
  );
  $(`.registration-step[data-registration-step="${previousStep}"]`).removeClass(
    'd-none'
  );
}

function isItRequired(input) {
  return input.is_mandatory == 'YES'
    ? " <span class='text-danger'>*</span>"
    : '';
}

function inputUI(input_obj) {
  const { input, options } = input_obj;
  let input_field = '';
  let option_list = '';
  input_global = currentLanguage == 'en' ? input.nameEnglish : input.nameFrench;
  enter_text = currentLanguage == 'en' ? 'Enter' : 'Entrer';
  select_text = currentLanguage == 'en' ? 'Select' : 'Selectioner';
  switch (true) {
    case input.inputtype.id == 1:
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
        <label class="form-custom-label" for="${
          input.inputcode
        }"> ${input_global}  ${isItRequired(input)}</label>
            <input type="text" class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}">
        </div>    
      `;
      break;
    case input.inputtype.id == 2:
      // If this is the nationality field, filter out Hong Kong
      if (input.inputcode === 'input_id_1704918388') {
        options.forEach((option) => {
          if (
            option.contentEnglish.trim().toLowerCase() !== 'hong kong' &&
            option.contentEnglish.trim().toLowerCase() !== 'hong kong sar'
          ) {
            option_list += `
              <option value="${option.contentEnglish}">${option.contentEnglish}</option>
            `;
          }
        });
      } else {
        options.forEach((option) => {
          option_list += `
            <option value="${option.contentEnglish}">${option.contentEnglish}</option>
          `;
        });
      }
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
        <label class="form-custom-label select-labels" for="${
          input.inputcode
        }"> ${input_global}  ${isItRequired(input)}</label>
            <select class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}">
                <option value="" selected disabled> </option>
                ${option_list}
            </select>
        </div>    
      `;
      break;
    case input.inputtype.id == 3:
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
            <input type="color" class="form-control p-0" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}" value="#ffffff">
            <label class="custom-button-selector" for="${
              input.inputcode
            }">Click Here to select a color</label>
            <label class="form-custom-label" for="${
              input.inputcode
            }"> ${input_global}  ${isItRequired(input)}</label>
        </div>    
      `;
      break;
    case input.inputtype.id == 4:
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
            <input type="date" class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}">
            <label class="form-custom-label select-labels" for="${
              input.inputcode
            }"> ${input_global}  ${isItRequired(input)}</label>
        </div>    
      `;
      break;
    case input.inputtype.id == 5:
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
        <label class="form-custom-label" for="${
          input.inputcode
        }"> ${input_global}  ${isItRequired(input)}</label>     
            <input type="email" class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}" >
        </div>
      `;
      break;
    case input.inputtype.id == 6:
      input_field = `
        <div class="file-upload mb-4 row">
          <div class="file-upload-select col-12" id="file-${input.inputcode}" onclick="fileSelect('${input.inputcode}', 'file')">
            <div class="file-select-button" >Choose File</div>
            <div class="file-select-name" id="file-${input.inputcode}-name">Uploade ${input_global}...</div>
            <textarea class="d-none" id="${input.inputcode}-base64"></textarea>
            <input type="file" id="${input.inputcode}" data-input-type="${input.inputtype.id}" name="${input.inputcode}" data-name="${input_global}" id="${input.inputcode}" data-input-type="${input.inputtype.id}" name="${input.inputcode}" data-input-code="${input.inputcode}" accept="application/pdf">
          </div>
          <div class="col-12 position-relative d-flex justify-content-center d-none border m-3 widt-96" id="preview-box-${input.inputcode}">
            <span class="pdf-sliders-left btn btn-info text-white" id="prev-page-${input.inputcode}"><i class="fas fa-chevron-left"></i></span>
            <span class="pdf-sliders-right btn btn-info text-white" id="next-page-${input.inputcode}"><i class="fas fa-chevron-right"></i></span>
            <canvas id="preview-${input.inputcode}"></canvas>
          </div>
        </div>
      `;
      break;
    case input.inputtype.id == 7:
      input_field = `
        <div class="file-upload mb-4 row">
          <div class="file-upload-select col-12" id="file-${
            input.inputcode
          }" onclick="fileSelect('${input.inputcode}', 'image')">
            <div class="file-select-button" >Choose File</div>
            <div class="file-select-name" id="file-${
              input.inputcode
            }-name">Uploade ${input_global}  ${isItRequired(input)} </div>
            <textarea class="d-none" id="${input.inputcode}-base64"></textarea>
            <input type="file" id="${input.inputcode}" data-input-type="${
        input.inputtype.id
      }" name="${input.inputcode}" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}" accept="image/*">
          </div>
          <div class="col-12 border m-3 widt-96 d-none" id="parent-${
            input.inputcode
          }">
            <img id="preview-${
              input.inputcode
            }" src="" class="image-previewer-form d-none">
          </div>
        </div>
      `;
      break;
    case input.inputtype.id == 8:
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
          <input type="number" class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}" >
          <label class="form-custom-label" for="${
            input.inputcode
          }"> ${input_global}  ${isItRequired(input)}</label>
        </div> 
      `;
      break;
    case input.inputtype.id == 9:
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
          <input type="password" class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}" >
          <label class="form-custom-label" for="${
            input.inputcode
          }"> ${input_global}  ${isItRequired(input)}</label>
        </div>    
      `;
      break;
    case input.inputtype.id == 10:
      options.forEach((option, index) => {
        option_list += `
          <div class="form-check">
            <input class="form-check-input"  type="radio" name="${input.inputcode}" value="${option.contentEnglish}" data-name="${input_global}" data-input-code="${input.inputcode}" id="checkbox-${option.id}">
            <label class="form-check-label" for="checkbox-${option.id}">${option.contentEnglish}</label>
          </div>
        `;
      });
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12"><label class="form-checkboxes">Choose ${input_global}  ${isItRequired(
        input
      )} </label>
            ${option_list}
        </div>
      `;
      break;
    case input.inputtype.id == 12:
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
        <label class="form-custom-label phone-label" for="${
          input.inputcode
        }"> ${input_global}  ${isItRequired(input)}</label>
            <input type="tel" class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}">
            
        </div>    
      `;
      break;
    case input.inputtype.id == 13:
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
          <input type="time" class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}" >
          <label class="form-custom-label select-labels" for="${
            input.inputcode
          }">${enter_text} ${input_global}  ${isItRequired(input)}</label>
        </div>    
      `;
      break;
    case input.inputtype.id == 14:
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
          <input type="url" class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}" >
          <label class="form-custom-label" for="${
            input.inputcode
          }"> ${input_global}  ${isItRequired(input)}</label>
        </div>    
      `;
      break;
    case input.inputtype.id == 15:
      input_field = `
      <div class="form-group col-lg-4 px-4 col-sm-12">
      <label class="form-custom-label" for="${
        input.inputcode
      }"> ${input_global}  ${isItRequired(input)}</label>
        <textarea class="form-control" data-name="${input_global}" id="${
        input.inputcode
      }" data-input-type="${input.inputtype.id}" name="${
        input.inputcode
      }" data-input-code="${input.inputcode}"></textarea>
        
      </div>
    `;
      break;
    case input.inputtype.id == 16:
      options.forEach((option, index) => {
        option_list += `
          <div class="form-check">
            <input class="form-check-input"  name="${input.inputcode}" type="checkbox" value="${option.contentEnglish}" data-name="${input_global}" data-input-code="${input.inputcode}" id="checkbox-${option.id}">
            <label class="form-check-label" for="checkbox-${option.id}">${option.contentEnglish}</label>
          </div>
        `;
      });
      input_field = `
        <div class="form-group col-lg-4 px-4 col-sm-12">
          <label>Choose ${input_global}  ${isItRequired(input)} </label>
          ${option_list}
        </div>
      `;
      break;
  }
  return input_field;
}

function fileSelect(id, type) {
  let fileInput = document.getElementById(id);
  let base64EncodedInput = document.getElementById(id + '-base64');
  let fileSelect = document.getElementById('file-' + id);
  let preview = document.getElementById('preview-' + id);
  let prevButton = document.getElementById('prev-page-' + id);
  let nextButton = document.getElementById('next-page-' + id);
  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  fileInput.click();
  fileInput.onchange = async function () {
    $('.loading-overlay').addClass('is-active');
    let file = fileInput.files[0];
    if (file) {
      let selectNameId = 'file-' + id + '-name';
      let selectName = document.getElementById(selectNameId);
      selectName.innerText = file.name;
      const reader = new FileReader();
      switch (type) {
        case 'image':
          compressImage(file, 1024, 1024, 0.5).then(function (result) {
            preview.setAttribute('src', result);
            base64EncodedInput.value = result;
            preview.classList.remove('d-none');
            document.getElementById('parent-' + id).classList.remove('d-none');
            $('.loading-overlay').removeClass('is-active');
          });
          break;
        case 'file':
          base64EncodedInput.value = await pdfToBase64(file);
          reader.onload = function () {
            let typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(function (pdfDoc_) {
              pdfDoc = pdfDoc_;
              renderPage(pageNum);
              document
                .getElementById('preview-box-' + id)
                .classList.remove('d-none');
              $('.loading-overlay').removeClass('is-active');
            });
          };
          reader.readAsArrayBuffer(file);
          break;
      }
    }
  };

  function pdfToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64String = reader.result
          .replace('data:', '')
          .replace(/^.+,/, '');
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function (page) {
      let ctx = preview.getContext('2d');
      let viewport = page.getViewport({
        scale: 1,
      });

      preview.height = viewport.height;
      preview.width = viewport.width;

      let renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      let renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });
  }

  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  function onPrevPage() {
    if (pageNum <= 1) {
      prevButton.classList.add('disabled-btn');
      return;
    }
    prevButton.classList.remove('disabled-btn');
    pageNum--;
    queueRenderPage(pageNum);
  }

  function onNextPage() {
    if (pdfDoc == null || pageNum >= pdfDoc.numPages) {
      nextButton.classList.add('disabled-btn');
      return;
    }
    nextButton.classList.remove('disabled-btn');
    pageNum++;
    queueRenderPage(pageNum);
  }

  if (
    typeof prevButton !== 'undefined' &&
    prevButton !== null &&
    typeof nextButton !== 'undefined' &&
    nextButton !== null
  ) {
    prevButton.addEventListener('click', onPrevPage);
    nextButton.addEventListener('click', onNextPage);
  }
}

function getFormInputData() {
  let data = new FormData();
  $('.loader').fadeIn();
  $('.loader-overlay').fadeIn('slow');
  const delegate_data = [];
  const inputs = $('[name^=input_id_]');
  inputs.each(function (index, input) {
    let value_recorded = '';
    if (input.type == 'file') {
      value_recorded =
        input.files[0] != undefined
          ? $(`#${$(input).attr('data-input-code')}-base64`).val()
          : '';
    } else if (input.type == 'checkbox' || input.type == 'radio') {
      if (input.checked) {
        value_recorded = input.value;
      }
    } else {
      value_recorded = input.value;
    }
    if (value_recorded != '') {
      if ($(input).attr('data-input-code') == 'input_id_52307') {
        data.append('registration_email', value_recorded);
        localStorage.setItem('registration_email', value_recorded);
      }
      if ($(input).attr('data-input-code') == 'input_id_21576') {
        data.append('first_name', value_recorded);
        localStorage.setItem('first_name', value_recorded);
      }
      if ($(input).attr('data-input-code') == 'input_id_35129') {
        data.append('last_name', value_recorded);
        localStorage.setItem('last_name', value_recorded);
      }
      delegate_data.push({
        input_code: $(input).attr('data-input-code'),
        input_type: $(input).attr('data-input-type'),
        input_value: value_recorded,
        input_name: $(input).attr('data-name'),
      });
    }
  });
  data.append('delegate_data', JSON.stringify(delegate_data));
  data.append('event_code', event_code);
  data.append('ticket_id', $('#ticket_id').val());
  data.append('order_id', $('#order_id').val());
  data.append('payment_token', $('#payment_token').val());
  data.append('payment_session', $('#payment_session').val());
  data.append('acknowleadgment', $('#acknowleadgment').val());
  data.append('attendence_type', $('#attendence_type').val());
  data.append('user_language', 'english');
  data.append('accompanied', 'NO');
  return data;
}

function submitForm() {
  return new Promise((resolve, reject) => {
    $('.loader').fadeIn();
    $('.loader-overlay').fadeIn('slow');
    let data = getFormInputData();
    if (
      $('#input_id_1729166628').val() == 'Bank Transfer' &&
      $('#input_id_1729321993').val() == ''
    ) {
      $('.loader').fadeOut();
      $('.loader-overlay').fadeOut('slow');
      alert('Please uppload a valid payment proof');
    } else {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('readystatechange', function () {
        if (this.readyState === 4) {
          $('#staticBackdrop').modal('hide');
          setTimeout(() => {
            $('.loader').fadeOut();
            $('.loader-overlay').fadeOut('slow');
          }, 1000);
          let res = JSON.parse(xhr.response);
          switch (this.status) {
            case 200:
              localStorage.setItem('badge_id', res.registration_number);
              $('#registration-form').html(`
                <div class="card-boxed text-center">
                  <img src="assets/img/success.png" style="height: 100px;width: 100px;margin-bottom: 40px;" class="img-fluid">
                  <h1>Thank you!</h1>
                  <p>Your registration has been successfully submitted, please check your email for further instructions.</p>
                </div>
              `);
              $('html, body').animate(
                {
                  scrollTop: $('#registration-form').offset().top - 15,
                },
                500
              );
              resolve();
              break;
            case 400:
              displayErrors(res);
              reject(res);
              break;
            case 500:
              $('#registration-form').prepend(`
                <div class="col-8 mx-auto alert alert-danger alert-dismissible fade show" role="alert" id="notification-draw">
                  <strong>Error!</strong> Internal Server Error
                  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                      <i class="fas fa-times"></i>
                  </button>
                </div>
              `);
              $('html, body').animate(
                {
                  scrollTop: $('#notification-draw').offset().top - 15,
                },
                500
              );
              reject({ message: 'Internal Server Error' });
              break;
          }
        }
      });
      xhr.open('POST', `${request_host}/Api/Register-Delegate`);
      xhr.send(data);
    }
  });
}

$('#registration-form').submit(function (e) {
  e.preventDefault();
  if ($('[name^=input_id_]').length > 0) {
    submitForm();
  }
});

function compressImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => {
        reject(err);
      };
    };
    reader.onerror = (err) => {
      reject(err);
    };
  });
}

function resetPayment() {
  $('#input_id_75031').val('').trigger('change');
  $('#input_id_75031').siblings('label').removeClass('select-labels-active');
  $('html, body').animate(
    {
      scrollTop: $('#registration-form').offset().top - 15,
    },
    500
  );
}
function callPaymentUI() {
  $('#notification-row').addClass('d-none');

  submitForm()
    .then(() => {
      if (localStorage.getItem('payment_method') == 'Visa Card / MasterCard') {
        let fee = localStorage.getItem('paymentAmount');
        let params = {
          amount: fee,
          firstname: localStorage.getItem('first_name'),
          lastname: localStorage.getItem('last_name'),
          badge_id: localStorage.getItem('badge_id'),
        };
        window.location.href =
          '/payment.php/en?identityId=' +
          encodeURIComponent(fee) +
          '&firstname=' +
          encodeURIComponent(params.firstname) +
          '&lastname=' +
          encodeURIComponent(params.lastname) +
          '&badge_id=' +
          encodeURIComponent(params.badge_id);
      }
      // clear all local storage
      localStorage.clear();
    })
    .catch((error) => {
      console.error('Error occurred while submitting the form:', error);
    });
}

function errorCallback(error) {
  $('#notification-image').attr('src', 'assets/img/payment-failed-error.gif');
  $('#message-header').text('Unable to process payment');
  $('#message-description').text(error['error.explanation']);
  $('#staticBackdrop').modal('show');
  $('#payment_action_name').html(
    `<button type="button" class="searchBoxToggler vs-btn style2 col-12" onclick="reactualize_session()">Retry</button>`
  );
  $('#payment-target').css('max-height', 'initial');
  $('#notification-row').removeClass('d-none');
}

function cancelCallback() {
  $('#notification-image').attr('src', 'assets/img/payment-failed-error.gif');
  $('#message-header').text('Payment Cancelled');
  $('#message-description').text(
    'We are sorry for the inconvenience, your payment was cancelled'
  );
  $('#staticBackdrop').modal('show');
  $('#payment_action_name').html(
    `<button type="button" id="closing_modal" class="searchBoxToggler vs-btn style2 col-12" data-bs-dismiss="modal">Close</button>`
  );
  $('#payment-target').css('max-height', 'initial');
  $('#notification-row').removeClass('d-none');
}

function completeCallback(result) {
  if (result.resultIndicator === $('#payment_token').val()) {
    $('#notification-row').removeClass('d-none');
    $('#notification-row').html(`
      <div class="col-12 text-center">
        <img src="assets/img/registration.gif" class="img-fluid" style="height: 20vh;">
        <h6 class="mt-5">Do not close or refresh this page, your payment is being processed</h6>
      </div>
    `);
    $('#acknowleadgment').val(result.resultIndicator);
    $('#hc-comms-layer-iframe').remove();
    submitForm();
  } else {
    $('#notification-row').removeClass('d-none');
    $('#notification-row').html(`
      <div class="col-12 text-center">
        <img src="assets/img/registration.gif" class="img-fluid" style="height: 20vh;">
        <h6 class="mt-5">Payement failed, please try again</h6>
      </div>
    `);
    $('#hc-comms-layer-iframe').remove();
  }
}

function reactualize_session() {
  $('#notification-image').attr('src', 'assets/img/loading.gif');
  $('#message-header').text('Reactualizing Payment Session');
  $('#message-description').text(
    'Please wait while we reactualize your payment session'
  );
  $('#payment_action_name').html('');
  // initialize_payment(true);
}

function displayErrors(res) {
  let errors = '';
  res.message.forEach((error) => {
    errors += `<li style="margin-left: 15px;">${error}</li>`;
  });
  $('#notification-draw').remove();
  $('#registration-form').prepend(`
    <div class="col-8 mx-auto alert alert-danger alert-dismissible fade show" role="alert" id="notification-draw">
      <strong>Error!</strong> Kindly fix the erros below and try again
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
          <i class="fas fa-times"></i>
      </button>
      <div class="mt-2">
          <ul class="mb-0">
              ${errors}
          </ul>
      </div>
    </div>
  `);
  $('html, body').animate(
    {
      scrollTop: $('#notification-draw').offset().top - 15,
    },
    500
  );
}
