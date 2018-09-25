'use strict';

/* global jQuery */
/* eslint no-param-reassign: ["error", { "props": false }] */

(function ($) {
  // eslint-disable-line
  $.fn.rsSignUp = function multiStep(opts) {
    var defaults = {
      form: false,
      validate: false
    };
    var options = $.extend({}, defaults, opts);
    var $cost = $('.rsSignup-cost, #summary-total');
    var $boxes = $('.rsSignup-boxes');
    var $globalErrors = $('.rsForm-global-errors');
    var $loader = $('.rsForm-loader');
    var $submitStep = $('.rsForm-submitStep');
    var $productSummary = $('.rsForm-summary-products');
    var totalCost = 0;
    var totalQuantity = 0;
    var products = {
      email: 0,
      emailPlus: 0,
      exchange: 0
    };

    var methods = {
      addBoxes: function addBoxes($step) {
        totalQuantity = 0;
        totalCost = 0;
        products.email = 0;
        products.emailPlus = 0;
        products.exchange = 0;
        $step.find('[name="rs-add-quantity"]').each(function input() {
          var $inp = $(this);
          var type = $inp.attr('data-product');
          var pennies = parseInt($inp.attr('data-cost'), 10);
          var val = parseInt($inp.val(), 10);
          if (val >= 0) {
            totalCost += pennies * val;
            totalQuantity += val;
            products[type] = val;
          }
        });
        if (totalQuantity >= 0) {
          $boxes.html(totalQuantity);
          $cost.html(methods.convertToDollars(totalCost));
        }
      },
      convertToDollars: function convertToDollars(pennies) {
        var dollars = pennies / 100;
        return dollars.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        });
      }
    };

    // validation methods
    var validation = {
      checkRequired: function checkRequired(val) {
        return {
          passed: val.trim() !== ''
        };
      },
      checkMinVal: function checkMinVal(val, min) {
        return {
          passed: parseInt(val, 10) >= parseInt(min, 10)
        };
      },
      checkMaxVal: function checkMaxVal(val, max) {
        return {
          passed: parseInt(val, 10) <= parseInt(max, 10)
        };
      },

      initialPassword: '',
      confirmPassword: function confirmPassword(val, initial) {
        return {
          passed: val === initial
        };
      },
      checkType: function checkType(val, type) {
        var types = {
          email: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi,
          creditcard: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
          cvv: /^\d{3}$/,
          date: /^\d{2}\s\/\s\d{2}$/
        };
        return {
          passed: val.match(types[type])
        };
      },
      passed: function passed($field) {
        var totalFailed = [];
        $field.find('input').each(function check() {
          var $input = $(this);
          var inputFailed = [];
          // check for validation message containers
          var $msgEl = $input.next('.rsMultiStep-validation-message');
          if ($msgEl.length > 0) {
            // msg container is there so we need to empty it.
            $msgEl.html('');
          } else {
            // msg container not there yet so inject it
            $msgEl = $('<div class="rsMultiStep-validation-message"></div>');
            $msgEl.insertAfter($input);
          }
          // check for what to even validate
          var attr = $input.attr('data-validate');
          var val = $input.val();
          if (attr) {
            var settings = JSON.parse(attr);
            // check required
            if (settings.required && !validation.checkRequired(val).passed) {
              var msg = 'This value is required';
              totalFailed.push(msg);
              inputFailed.push(msg);
            }
            // check min values
            if (!isNaN(settings.min) && !validation.checkMinVal(val, settings.min).passed) {
              var _msg = 'This value must be at least ' + settings.min;
              totalFailed.push(_msg);
              inputFailed.push(_msg);
            }
            // check max values
            if (!isNaN(settings.max) && !validation.checkMaxVal(val, settings.max).passed) {
              var _msg2 = 'This value must not exceed ' + settings.max;
              totalFailed.push(_msg2);
              inputFailed.push(_msg2);
            }
            // check for types to validate
            if (settings.type && !validation.checkType(val, settings.type).passed) {
              var _msg3 = 'This value must have a valid ' + settings.type + ' format';
              totalFailed.push(_msg3);
              inputFailed.push(_msg3);
            }
            // password confirmations
            if (settings.password) {
              if (settings.password === 'initial') {
                validation.initialPassword = val;
              }
              if (settings.password === 'match' && !validation.confirmPassword(val, validation.initialPassword).passed) {
                var _msg4 = 'Your passwords do not match';
                totalFailed.push(_msg4);
                inputFailed.push(_msg4);
              }
            }
            // show all errors
            $msgEl.html(inputFailed.join('. '));
          }
        });
        return totalFailed.length < 1;
      }
    };

    var $multiStep = $(this);
    var $steps = $multiStep.find('.rsMultiStep-step');
    // add submit button to second step
    $steps.eq(1).find('.rsMultiStep-btnRow').append('<button class="rsMultiStep-submitBtn">Purchase</button>');
    $steps.each(function runSteps() {
      var $this = $(this);
      var indexNum = $this.index() + 1;
      var $stepLabel = $this.attr('data-step-label');

      $this.parent().prev('.rsMultiStep-progress').append('<span class="rsMultiStep-progressStep rsMultiStep-progressStep' + indexNum + '">\n                              <div class="rsMultiStep-progressStep-num"></div>\n                             </span>');
      $this.parent().prev('.rsMultiStep-progress').find('.rsMultiStep-progressStep' + indexNum).append($stepLabel);
      $this.parent().prev('.rsMultiStep-progress').find('.rsMultiStep-progressStep' + indexNum).find('.rsMultiStep-progressStep-num').html(indexNum);

      var $nextBtn = $('<button class="rsMultiStep-nextBtn">Next</button>');
      var $backBtn = $('<button class="rsMultiStep-backBtn">Back</button>');
      var $msRow = $this.find('.rsMultiStep-btnRow');
      var $msProgress = $this.parent().prev('.rsMultiStep-progress');

      if ($this.is(':first-child')) {
        $this.addClass('rsMultiStep-stepActive');
        $msProgress.find('.rsMultiStep-progressStep' + indexNum + ' .rsMultiStep-progressStep-num').addClass('rsMultiStep-progressStep-numActive');
        $msRow.prepend($nextBtn);
      }

      if ($this.is(':not(:first-child)') && $this.is(':not(:last-child)')) {
        $msRow.prepend($backBtn);
      }

      // bind keyup events to quantity type inputs so we can show totals
      $this.find('[name="rs-add-quantity"]').each(function input() {
        $(this).on('keyup', function () {
          return methods.addBoxes($this);
        });
      });

      var moveNext = function moveNext() {
        // swap to next step
        $this.css('height', $this.outerHeight());
        $this.css('width', $this.outerWidth());
        $this.addClass('position-absolute');
        $this.animate({
          marginLeft: '-200px',
          opacity: 0
        }, 300);
        $this.next().addClass('rsMultiStep-stepActive');
        setTimeout(function () {
          $this.removeClass('rsMultiStep-stepActive');
        }, 300);
        $msProgress.find('.rsMultiStep-progressStep' + indexNum).next().find('.rsMultiStep-progressStep-num').addClass('rsMultiStep-progressStep-numActive');
      };

      var moveBack = function moveBack() {
        $this.removeClass('rsMultiStep-stepActive');
        $this.prev().removeClass('position-absolute');
        $this.prev().addClass('rsMultiStep-stepActive');
        $this.prev().animate({
          marginLeft: '0px',
          opacity: 1
        }, 300);
        setTimeout(function () {
          $this.prev().css('height', '');
          $this.prev().css('width', '');
        }, 300);
        $msProgress.find('.rsMultiStep-progressStep' + indexNum + ' .rsMultiStep-progressStep-num').removeClass('rsMultiStep-progressStep-numActive');
      };

      var $insertedBackBtn = $this.find('.rsMultiStep-backBtn');
      var $insertedNextBtn = $this.find('.rsMultiStep-nextBtn, .rsMultiStep-submitBtn');

      // next click event
      $insertedNextBtn.click(function (e) {
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
            var testCORS = 'https://cors-anywhere.herokuapp.com/';
            $loader.show();
            $submitStep.hide();
            $insertedBackBtn.hide();
            $insertedNextBtn.hide();
            $.ajax({
              type: 'POST',
              url: testCORS + 'https://postman-echo.com/post',
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify({ form: 'data-here' }),
              success: function success() {
                $productSummary.html('\n                  <span class="rsForm-summary-quantity">Rackspace Email x ' + products.email + ' Mailboxe(s)</span>\n                  <span class="rsForm-summary-quantity">Rackspace Email Plus x ' + products.emailPlus + ' Mailboxe(s)</span>\n                  <span class="rsForm-summary-quantity">Microsoft Exchange x ' + products.exchange + ' Mailboxe(s)</span>\n                ');
                moveNext();
              },
              error: function error() {
                $this.addClass('rsMultiStep-step-error');
                $globalErrors.show().html('There was an error. Please try again!');
              },
              complete: function complete() {
                $loader.hide();
                $submitStep.show();
                $insertedBackBtn.show();
                $insertedNextBtn.show();
              }
            });
          } else {
            moveNext();
          }
        }
      });

      // back click event
      $insertedBackBtn.click(function (e) {
        if (!$this.prev().is(':animated')) {
          e.preventDefault();
          moveBack();
        }
      });
    });
    $.fn.rsSignUp.test = $.extend({}, methods, validation);
    return this;
  };
})(jQuery);