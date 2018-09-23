/* global jQuery */
/* eslint no-param-reassign: ["error", { "props": false }] */

(function($) { // eslint-disable-line
  $.fn.multiStep = function multiStep(opts) {
    const defaults = {
      form: false,
      validate: false,
    };
    const options = $.extend({}, defaults, opts);
    const $cost = $('.rsSignup-cost');
    const $boxes = $('.rsSignup-boxes');
    const $globalErrors = $('.rsForm-global-errors');
    let totalCost = 0;
    let totalQuantity = 0;

    const methods = {
      addBoxes($step) {
        totalQuantity = 0;
        totalCost = 0;
        $step.find('[name="rs-add-quantity"]').each(function input() {
          const pennies = parseInt($(this).attr('data-cost'), 10);
          const val = parseInt($(this).val(), 10);
          if (val >= 0) {
            totalCost += (pennies * val);
            totalQuantity += val;
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
      checkRequired($input) {
        return {
          passed: $input.val().trim() !== '',
        };
      },
      checkMinVal($input, min) {
        return {
          passed: parseInt($input.val(), 10) >= parseInt(min, 10),
        };
      },
      checkMaxVal($input, max) {
        return {
          passed: parseInt($input.val(), 10) <= parseInt(max, 10),
        };
      },
      checkType($input, type) {
        const types = {
          email: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi,
        };
        return {
          passed: $input.val().match(types[type]),
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
          if (attr) {
            const settings = JSON.parse(attr);
            // check required
            if (settings.required && !validation.checkRequired($input).passed) {
              const msg = 'This value is required';
              totalFailed.push(msg);
              inputFailed.push(msg);
            }
            // check min values
            if (!isNaN(settings.min) && !validation.checkMinVal($input, settings.min).passed) {
              const msg = `This value must be at least ${settings.min}`;
              totalFailed.push(msg);
              inputFailed.push(msg);
            }
            // check max values
            if (!isNaN(settings.max) && !validation.checkMaxVal($input, settings.max).passed) {
              const msg = `This value must not exceed ${settings.max}`;
              totalFailed.push(msg);
              inputFailed.push(msg);
            }
            // check for types to validate
            if (settings.type && !validation.checkType($input, settings.type).passed) {
              const msg = `This value must have a valid ${settings.type} format`;
              totalFailed.push(msg);
              inputFailed.push(msg);
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

      if ($this.is(':last-child')) {
        // $msRow.prepend($backBtn);
      }

      if ($this.is(':not(:first-child)') && $this.is(':not(:last-child)')) {
        // $msRow.prepend($nextBtn);
        $msRow.prepend($backBtn);
      }

      // bind keyup events to quantity type inputs so we can show totals
      $this.find('[name="rs-add-quantity"]').each(function input() {
        $(this).on('keyup', () => methods.addBoxes($this));
      });

      // next click event
      $this.find('.rsMultiStep-nextBtn, .rsMultiStep-submitBtn').click((e) => {
        if (!$this.is(':animated')) {
          e.preventDefault();

          // don't change steps unless validation passes
          if (options.form && options.validate && !validation.passed($this)) {
            return;
          }

          // check that at least 1 email box is checked before proceeding
          $globalErrors.hide();
          if (totalQuantity <= 0) {
            $globalErrors.show().html('You must have at least 1 mail box to proceed.');
            return;
          }

          // TODO check if submit button, then run loader and move to Confirmation

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
        }
      });

      // back click event
      $this.find('.rsMultiStep-backBtn').click((e) => {
        if (!$this.prev().is(':animated')) {
          e.preventDefault();
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
        }
      });
    });
    return this;
  };
}(jQuery));
