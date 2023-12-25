// ==UserScript==
// @name         Fox112-Divera-zu-Dienstbuch
// @namespace    http://tampermonkey.net/
// @version      2023-12-17
// @description  try to take over the world!
// @author       You
// @match        https://lro.fox112-mv.de/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fox112-mv.de
// @grant        none
// @require https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function ($, undefined) {
  $(function () {
    let imgUp = $('img[title="Zum Löschen vorher alle Dienstbeteiligungen entfernen und ggf. die Fixierung lösen"]')
    if (imgUp.length < 1) {
      return
    }

    let textarea = $('<textarea/>')
    let button = $('<button>Auswählen</button>').click( () => {
        let notFounds = []
        // input "Alfred Meier\nMax Mustermann"
        textarea.val().split('\n').forEach( (name) => {
            name = name.trim()
            let firstName = name.replace(/^(.*)\s([^\s]+)$/, "$1").trim()
            let lastName = name.replace(/^(.*)\s([^\s]+)$/, "$2").trim()

            if (name == "Felipe Catalan Bell") {
                firstName = "Felipe"
                lastName = "Catalan Bell"
            }

            let founds = imgUp.closest('table').find('font:contains(' + lastName + ', ' + firstName + ')')
                .filter(function() { return $(this).children().length === 0;})
                .parent()
            if (founds.length != 1) {
                notFounds.push(name)
            } else {
                console.log(founds.parent().find('input[type=CheckBox]'))
                founds.parent().find('input[type=CheckBox]').prop('checked', true)
            }
        })
        textarea.val("")
        if (notFounds.length > 0) {
            textarea.val(notFounds.join("\n"))
            alert("Einige Namen konnten nicht gefunden werden:\n" + notFounds.join("\n"))
        }
    })
    let area = $('<div/>').append(textarea).append(button).insertBefore(imgUp.closest('table'))

  });
})(window.jQuery.noConflict(true));