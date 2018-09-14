(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals (root is window)
    root.zoValidator = factory(root.jQuery);
  }
}(typeof self !== 'undefined' ? self : this, function ($) {
  'use strict';

  var exports = {},
    EVENT_NAMESPACE = '.zo-validator',
    FORM_SELECTOR = 'form.zo-form',
    ERROR_TEXT_CLASS = 'zo-validator-user-error',
    ERROR_ATTRIBUTE = 'data-is-invalid',
    ANIMATION_CLASS = 'zo-validator-animating';

  var validityChangeEvents = ['blur change'],
    errorAnimationDuration = 150;

  var getForm = function(form) {
    return form ? $(form) : $(FORM_SELECTOR);
  };

  var createErrorEl = function(msg) {
    return $('<div></div>', {
      'class': ERROR_TEXT_CLASS,
      'text': msg,
      'style': 'display: none'
    });
  };

  var getValidityChangeEventsStr = function(namespace) {
    return validityChangeEvents.reduce(function(returnStr, currentEvt) {
      if (returnStr) {
        returnStr += ' ';
      }

      return returnStr + currentEvt + namespace;
    }, '');
  };

  var displayError = function(errorEl) {
    var $error = $(errorEl),
      fnAnimationClass = ANIMATION_CLASS + '-error-display',
      height;

    if ($error.is('.' + fnAnimationClass + ':animated')) {
      return;
    }

    $error.stop(true, true);
    $error.addClass(fnAnimationClass);

    $error.css('display', '');

    height = $error.outerHeight(true);

    $error.css({
      'marginTop': '0',
      'marginBottom': '0',
      'paddingTop': '0',
      'paddingBottom': '0',
      'height': 1,
      'overflow-y': 'hidden'
    });

    $error.animate({
      'height': height
    }, {
      'duration': errorAnimationDuration,
      'easing': 'linear',
      'complete': function() {
        $error.removeClass(fnAnimationClass);
        $error.css({
          'marginTop': '',
          'marginBottom': '',
          'paddingTop': '',
          'paddingBottom': '',
          'height': '',
          'overflow-y': ''
        });
      }
    });
  };

  var hideError = function(errorEl, callback) {
    var $error = $(errorEl),
      fnAnimationClass = ANIMATION_CLASS + '-error-hide',
      height = $error.outerHeight(true);

    if ($error.is('.' + fnAnimationClass + ':animated')) {
      return;
    }

    $error.stop(true, true);
    $error.addClass(fnAnimationClass);

    $error
      .css({
        'marginTop': '0',
        'marginBottom': '0',
        'paddingTop': '0',
        'paddingBottom': '0',
        'height': height,
        'overflow-y': 'hidden'
      })
      .animate({
        'height': 1
      }, {
        'duration': errorAnimationDuration,
        'easing': 'linear',
        'complete': function() {
          $error.removeClass(fnAnimationClass);

          $error.css({
            'marginTop': '',
            'marginBottom': '',
            'paddingTop': '',
            'paddingBottom': '',
            'height': '',
            'overflow-y': '',
            'display': 'none'
          });

          callback();
        }
      });
  };

  var onInputEvt = function(evt) {
    console.log(evt.type, 'EVENT FIRED ON', this);

    var isValid = this.checkValidity(),
      $this = $(this),
      $parent = $this.parent(),
      $errors = $parent.find('.' + ERROR_TEXT_CLASS),
      $error = $errors;

    if (!isValid) {
      if (!$errors.length) {
        $error = createErrorEl('There is an error.');

        $parent.append($error);
      }

      $this.attr(ERROR_ATTRIBUTE, true);
      displayError($error)
    } else {
      hideError($errors, function() {
        $this.removeAttr(ERROR_ATTRIBUTE);
      });
    }
  };

  exports.initForm = function(form) {
    var $form = getForm(form);

    // Remove all event handlers that may have been previously added to our form (within our module event namespace)
    $form.add(':input', $form).off(EVENT_NAMESPACE);

    $form.find(':input').on(getValidityChangeEventsStr(EVENT_NAMESPACE), onInputEvt);
  };

  exports.getFormValues = function(form) {
    var $form = getForm(form);

    return $form.serializeArray().reduce(function(resultObj, obj) {
      if (typeof resultObj[obj.name] === 'undefined') {
        resultObj[obj.name] = obj.value;
      } else if (Array.isArray(resultObj[obj.name])) {
        resultObj[obj.name].push(obj.value);
      } else {
        resultObj[obj.name] = [resultObj[obj.name], obj.value];
      }

      return resultObj;
    }, {});
  };

  exports.clearErrors = function(form) {
    var $form = getForm(form);

    $form.find('[' + ERROR_ATTRIBUTE + ']="true"').removeAttr(ERROR_ATTRIBUTE);
    $form.find('.' + ERROR_TEXT_CLASS).remove();
  };

  exports.validate = function(form) {
    var FN_EVENT_NAMESPACE = '.' + EVENT_NAMESPACE + '-validate-fn';

    var $form = getForm(form),
      valid = true;

    $form.one('invalid' + EVENT_NAMESPACE + FN_EVENT_NAMESPACE, function() {
      valid = false;
    });

    $form.find(':input').each(function() {
      this.checkValidity();
    });

    $form.off('invalid' + EVENT_NAMESPACE + FN_EVENT_NAMESPACE);

    return valid ? exports.getFormValues($form) : false;
  };

  $(function() {
    // Document Ready
    console.log('Validator Running...');
    exports.initForm();
  });

  return exports;
}));
