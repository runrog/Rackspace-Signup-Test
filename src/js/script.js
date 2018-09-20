/* global jQuery */
/* eslint no-param-reassign: ["error", { "props": false }] */

(function($) {
  $.fn.multiStep = function multiStep(opts) {
    const defaults = {
      form: false,
      validate: false,
    };
    const options = $.extend({}, defaults, opts);

    const validation = {
      checkRequired($input) {
        // console.log('input: ', $input.val());
      },
      passed($field) {
        const failed = [];
        $field.find('input').each(function check() {
          const $input = $(this);
          const attr = $input.attr('data-validate');
          if (attr) {
            const settings = JSON.parse(attr);
            if (settings.required) {
              validation.checkRequired($input);
            }
          }
        });
        // return failed.length < 1;
        return false;
      },
    };

    const $multiStep = $(this);
    $multiStep.find('.rsMultiStep-step').each(function runSteps() {
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
        $msRow.prepend($backBtn);
      }

      if ($this.is(':not(:first-child)') && $this.is(':not(:last-child)')) {
        $msRow.prepend($nextBtn);
        $msRow.prepend($backBtn);
      }

      // next click event
      $this.find('.rsMultiStep-nextBtn').click((e) => {
        if (!$this.is(':animated')) {
          e.preventDefault();
          // check for form validation
          const passed = validation.passed($this);
          if (options.form && options.validate && !passed) {
            // TODO show all error messages
            return;
          }

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
