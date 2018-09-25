/* global jQuery */
/* eslint no-param-reassign: ["error", { "props": false }] */

(function($) { // eslint-disable-line
  $.fn.rsSignUp = function multiStep(opts) {
    const defaults = {
      form: false,
      validate: false,
    };
    const options = $.extend({}, defaults, opts);
    const $cost = $('.rsSignup-cost, #summary-total');
    const $boxes = $('.rsSignup-boxes');
    const $globalErrors = $('.rsForm-global-errors');
    const $loader = $('.rsForm-loader');
    const $submitStep = $('.rsForm-submitStep');
    const $productSummary = $('.rsForm-summary-products');
    let totalCost = 0;
    let totalQuantity = 0;
    const products = {
      email: 0,
      emailPlus: 0,
      exchange: 0,
    };

    const methods = {
      addBoxes($step) {
        totalQuantity = 0;
        totalCost = 0;
        products.email = 0;
        products.emailPlus = 0;
        products.exchange = 0;
        $step.find('[name="rs-add-quantity"]').each(function input() {
          const $inp = $(this);
          const type = $inp.attr('data-product');
          const pennies = parseInt($inp.attr('data-cost'), 10);
          const val = parseInt($inp.val(), 10);
          if (val >= 0) {
            totalCost += (pennies * val);
            totalQuantity += val;
            products[type] = val;
          }
        });
        if (totalQuantity >= 0) {
          $boxes.html(totalQuantity);
          $cost.html(methods.convertToDollars(totalCost));
        }
      },
      convertToDollars(pennies) {
        const dollars = pennies / 100;
        return dollars.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        });
      },
    };

    // validation methods
    const validation = {
      checkRequired(val) {
        return {
          passed: val.trim() !== '',
        };
      },
      checkMinVal(val, min) {
        return {
          passed: parseInt(val, 10) >= parseInt(min, 10),
        };
      },
      checkMaxVal(val, max) {
        return {
          passed: parseInt(val, 10) <= parseInt(max, 10),
        };
      },
      initialPassword: '',
      confirmPassword(val, initial) {
        return {
          passed: val === initial,
        };
      },
      checkType(val, type) {
        const types = {
          email: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi,
          creditcard: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
          cvv: /^\d{3}$/,
          date: /^\d{2}\s\/\s\d{2}$/,
        };
        return {
          passed: val.match(types[type]),
        };
      },
      passed($field) {
        const totalFailed = [];
        $field.find('input').each(function check() {
          const $input = $(this);
          const inputFailed = [];
          // check for validation message containers
          let $msgEl = $input.next('.rsMultiStep-validation-message');
          if ($msgEl.length > 0) {
            // msg container is there so we need to empty it.
            $msgEl.html('');
          } else {
            // msg container not there yet so inject it
            $msgEl = $('<div class="rsMultiStep-validation-message"></div>');
            $msgEl.insertAfter($input);
          }
          // check for what to even validate
          const attr = $input.attr('data-validate');
          const val = $input.val();
          if (attr) {
            const settings = JSON.parse(attr);
            // check required
            if (settings.required && !validation.checkRequired(val).passed) {
              const msg = 'This value is required';
              totalFailed.push(msg);
              inputFailed.push(msg);
            }
            // check min values
            if (!isNaN(settings.min) && !validation.checkMinVal(val, settings.min).passed) {
              const msg = `This value must be at least ${settings.min}`;
              totalFailed.push(msg);
              inputFailed.push(msg);
            }
            // check max values
            if (!isNaN(settings.max) && !validation.checkMaxVal(val, settings.max).passed) {
              const msg = `This value must not exceed ${settings.max}`;
              totalFailed.push(msg);
              inputFailed.push(msg);
            }
            // check for types to validate
            if (settings.type && !validation.checkType(val, settings.type).passed) {
              const msg = `This value must have a valid ${settings.type} format`;
              totalFailed.push(msg);
              inputFailed.push(msg);
            }
            // password confirmations
            if (settings.password) {
              if (settings.password === 'initial') {
                validation.initialPassword = val;
              }
              if (settings.password === 'match' && !validation.confirmPassword(val, validation.initialPassword).passed) {
                const msg = 'Your passwords do not match';
                totalFailed.push(msg);
                inputFailed.push(msg);
              }
            }
            // show all errors
            $msgEl.html(inputFailed.join('. '));
          }
        });
        return totalFailed.length < 1;
      },
    };

    const $multiStep = $(this);
    const $steps = $multiStep.find('.rsMultiStep-step');
    // add submit button to second step
    $steps.eq(1).find('.rsMultiStep-btnRow').append('<button class="rsMultiStep-submitBtn">Purchase</button>');
    $steps.each(function runSteps() {
      const $this = $(this);
      const indexNum = $this.index() + 1;
      const $stepLabel = $this.attr('data-step-label');

      $this.parent().prev('.rsMultiStep-progress')
                    .append(`<span class="rsMultiStep-progressStep rsMultiStep-progressStep${indexNum}">
                              <div class="rsMultiStep-progressStep-num"></div>
                             </span>`);
      $this.parent().prev('.rsMultiStep-progress')
                    .find(`.rsMultiStep-progressStep${indexNum}`)
                    .append($stepLabel);
      $this.parent().prev('.rsMultiStep-progress')
                    .find(`.rsMultiStep-progressStep${indexNum}`)
                    .find('.rsMultiStep-progressStep-num')
                    .html(indexNum);

      const $nextBtn = $('<button class="rsMultiStep-nextBtn">Next</button>');
      const $backBtn = $('<button class="rsMultiStep-backBtn">Back</button>');
      const $msRow = $this.find('.rsMultiStep-btnRow');
      const $msProgress = $this.parent().prev('.rsMultiStep-progress');

      if ($this.is(':first-child')) {
        $this.addClass('rsMultiStep-stepActive');
        $msProgress.find(`.rsMultiStep-progressStep${indexNum} .rsMultiStep-progressStep-num`)
                  .addClass('rsMultiStep-progressStep-numActive');
        $msRow.prepend($nextBtn);
      }

      if ($this.is(':not(:first-child)') && $this.is(':not(:last-child)')) {
        $msRow.prepend($backBtn);
      }

      // bind keyup events to quantity type inputs so we can show totals
      $this.find('[name="rs-add-quantity"]').each(function input() {
        $(this).on('keyup', () => methods.addBoxes($this));
      });

      const moveNext = () => {
        // swap to next step
        $this.css('height', $this.outerHeight());
        $this.css('width', $this.outerWidth());
        $this.addClass('position-absolute');
        $this.animate({
          marginLeft: '-200px',
          opacity: 0,
        }, 300);
        $this.next().addClass('rsMultiStep-stepActive');
        setTimeout(() => {
          $this.removeClass('rsMultiStep-stepActive');
        }, 300);
        $msProgress.find(`.rsMultiStep-progressStep${indexNum}`)
                  .next().find('.rsMultiStep-progressStep-num')
                  .addClass('rsMultiStep-progressStep-numActive');
      };

      const moveBack = () => {
        $this.removeClass('rsMultiStep-stepActive');
        $this.prev().removeClass('position-absolute');
        $this.prev().addClass('rsMultiStep-stepActive');
        $this.prev().animate({
          marginLeft: '0px',
          opacity: 1,
        }, 300);
        setTimeout(() => {
          $this.prev().css('height', '');
          $this.prev().css('width', '');
        }, 300);
        $msProgress.find(`.rsMultiStep-progressStep${indexNum} .rsMultiStep-progressStep-num`)
                  .removeClass('rsMultiStep-progressStep-numActive');
      };

      const $insertedBackBtn = $this.find('.rsMultiStep-backBtn');
      const $insertedNextBtn = $this.find('.rsMultiStep-nextBtn, .rsMultiStep-submitBtn');

      // next click event
      $insertedNextBtn.click((e) => {
        if (!$this.is(':animated')) {
          e.preventDefault();
          $this.removeClass('rsMultiStep-step-error');

          // don't change steps unless validation passes
          if (options.form && options.validate && !validation.passed($this)) {
            $this.addClass('rsMultiStep-step-error');
            return;
          }

          // check that at least 1 email box is checked before proceeding
          $globalErrors.hide();
          if (totalQuantity <= 0) {
            $globalErrors.show().html('You must have at least 1 mail box to proceed.');
            $this.addClass('rsMultiStep-step-error');
            return;
          }

          // if clicking submit button, run loader, submit form and move to confirmation
          if ($(e.currentTarget).hasClass('rsMultiStep-submitBtn')) {
            const testCORS = 'https://cors-anywhere.herokuapp.com/';
            $loader.show();
            $submitStep.hide();
            $insertedBackBtn.hide();
            $insertedNextBtn.hide();
            $.ajax({
              type: 'POST',
              url: `${testCORS}https://postman-echo.com/post`,
              headers: {
                'Content-Type': 'application/json',
              },
              data: JSON.stringify({ form: 'data-here' }),
              success() {
                $productSummary.html(`
                  <span class="rsForm-summary-quantity">Rackspace Email x ${products.email} Mailboxe(s)</span>
                  <span class="rsForm-summary-quantity">Rackspace Email Plus x ${products.emailPlus} Mailboxe(s)</span>
                  <span class="rsForm-summary-quantity">Microsoft Exchange x ${products.exchange} Mailboxe(s)</span>
                `);
                moveNext();
              },
              error() {
                $this.addClass('rsMultiStep-step-error');
                $globalErrors.show().html('There was an error. Please try again!');
              },
              complete() {
                $loader.hide();
                $submitStep.show();
                $insertedBackBtn.show();
                $insertedNextBtn.show();
              },
            });
          } else {
            moveNext();
          }
        }
      });

      // back click event
      $insertedBackBtn.click((e) => {
        if (!$this.prev().is(':animated')) {
          e.preventDefault();
          moveBack();
        }
      });
    });
    $.fn.rsSignUp.test = $.extend({}, methods, validation);
    return this;
  };
}(jQuery));
