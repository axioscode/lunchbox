var $text = null;
var $factList = null;
var $save = null;
var $poster = null;
var $themeButtons = null;
var $aspectRatioButtons = null;
var $fontSize = null;
var $timestamp = null;
var $bulletsToggleButtons = null;
var $kicker = null;
var $kickerInput = null;
var $source = null;
var $logoWrapper = null;
var $updateTime = null;
var $listItems = null;
var $list = null;

var sizes = {
  square: {
    val: 80,
    min: 64,
    max: 96
  },
  sixteenbynine: {
    val: 61,
    min: 47,
    max: 75
  }
};


/*
 * Run on page load.
 */
var onDocumentLoad = function() {
    $text = $('.poster blockquote p, .source');
    $factList = $('.poster blockquote');
    $save = $('#save');
    $poster = $('.poster');
    $themeButtons = $('#theme .btn');
    $aspectRatioButtons = $('#aspect-ratio .btn');
    $fontSize = $('#fontsize');
    $timestamp = $('.timestamp');
    $bulletsToggleButtons = $('#bullet-toggle .btn');
    $kicker = $('.kicker');
    $kickerInput = $('#kicker');
    $logoWrapper = $('.logo-wrapper');
    $list = $('.fact-list');
    $listItems = $('ul.fact-list').children();

    $save.on('click', saveImage);
    $themeButtons.on('click', onThemeClick);
    $aspectRatioButtons.on('click', onAspectRatioClick);
    $bulletsToggleButtons.on('click', onBulletToggleClick);
    $fontSize.on('change', adjustFontSize);
    $kickerInput.on('keyup', onKickerKeyup);

    adjustFontSize(null, sizes.sixteenbynine.val);
    processText();
    setupMediumEditor();

    $('[data-toggle="tooltip"]').tooltip();
}

/*
 * Change straight quotes to curly and double hyphens to em-dashes.
 */
var smarten = function(a) {
  a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
  a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
  a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
  a = a.replace(/"/g, "\u201d");                            // closing doubles
  a = a.replace(/--/g, "\u2014");                           // em-dashes
  a = a.replace(/ \u2014 /g, "\u2009\u2014\u2009");         // full spaces wrapping em dash
  return a;
}

/*
 * Convert a string to slug format
 */
var convertToSlug = function(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
}

/*
 * Cleanup whitespace and smart quotes on text inputs
 */
var processText = function() {
    $text = $('.poster blockquote p, .source');
    $text.each(function() {
        var rawText = $.trim($(this).html());
        $(this).html(smarten(rawText)).find('br').remove();
    });
}


/*
 * Convert the poster HTML/CSS to canvas and export an image
 */
var saveImage = function() {
    // first check if the quote actually fits
    if (($factList.offset().top + $factList.height()) > $logoWrapper.offset().top + 75) {
        var tooTallMessage = "Your list is too long. Shorten the text or choose a smaller font-size.";
    }

    if ($factList.children().length > 6) {
        var tooManyItems = "You have too many items in this list. Factlist is only meant for short, social graphics.";
    }

    if (tooTallMessage || tooManyItems) {
          var alertMessage;
          if (tooTallMessage && tooManyItems) {
              alertMessage = tooTallMessage + '\n' + tooManyItems;
          } else {
              alertMessage = (tooTallMessage) ? tooTallMessage : tooManyItems;
          }
          alert(alertMessage);
          return;
    }

    $('canvas').remove();
    processText();

    html2canvas($poster, {
      letterRendering: true,
      onrendered: function(canvas) {
        document.body.appendChild(canvas);
        window.oCanvas = document.getElementsByTagName("canvas");
        window.oCanvas = window.oCanvas[0];
        var strDataURI = window.oCanvas.toDataURL();

        var headline = $kicker.text().split(' ', 9);
        var filename = convertToSlug(headline.join(' '));

        var a = $("<a>").attr("href", strDataURI).attr("download", "factlist-" + filename + ".png").appendTo("body");

        a[0].click();

        a.remove();

        $('#download').attr('href', strDataURI).attr('target', '_blank');
        $('#download').trigger('click');
      }
    });
}

/*
 * Adjust the poster font size
 */
var adjustFontSize = function(e, size) {
    var newSize = size||$(this).val();

    var fontSize = newSize.toString() + 'px';
    $list.css('font-size', fontSize);
    $kicker.css('font-size', fontSize);
    if ($fontSize.val() !== newSize){
        $fontSize.val(newSize);
    };
}

/*
 * Select a poster theme
 */
var onThemeClick = function(e) {
    $themeButtons.removeClass().addClass('btn btn-primary');
    $(this).addClass('active');
    $poster.removeClass('poster-theme1 poster-theme2 poster-theme3 poster-theme4 poster-theme5 poster-theme6 poster-theme7')
                .addClass('poster-' + $(this).attr('id'));
}

/*
 * Select the poster aspect ratio
 */
var onAspectRatioClick = function(e) {
    $aspectRatioButtons.removeClass().addClass('btn btn-primary');
    $(this).addClass('active');
    $poster.removeClass('square sixteen-by-nine').addClass($(this).attr('id'));

    if ($poster.hasClass('sixteen-by-nine')) {
        $fontSize.attr('min', sizes.sixteenbynine.min);
        $fontSize.attr('max', sizes.sixteenbynine.max);
        $fontSize.val(sizes.sixteenbynine.val);
        adjustFontSize(null, sizes.sixteenbynine.val);
    } else {
      $fontSize.attr('min', sizes.square.min);
      $fontSize.attr('max', sizes.square.max);
      $fontSize.val(sizes.square.val);
      adjustFontSize(null, sizes.square.val);
    }
}

/*
 * Select the poster aspect ratio
 */
var onBulletToggleClick = function(e) {
    $bulletsToggleButtons.removeClass().addClass('btn btn-primary');
    $(this).addClass('active');
    console.log($(this).attr('id'));
    if ($(this).attr('id') === 'show-bullets') {
      $factList.addClass("unordered-list").removeClass("ordered-list")
    } else {
      $factList.addClass("ordered-list").removeClass("unordered-list")
    }
}

/*
 * Update the kicker text
 */
var onKickerKeyup = function(e) {
    var inputText = $(this).val();
    $kicker.text(inputText);
}

/*
 * Bind a medium editor to the poster blockquote
 */
var setupMediumEditor = function(){
    var quoteEl = document.querySelectorAll('.poster blockquote');

    var quoteEditor = new MediumEditor(quoteEl, {
        disableToolbar: true,
        placeholder: ''
    });

    $factList.focus();
}

$(onDocumentLoad);
