(function (doc, win){
    let ev = "orientationchange" in win ? "orientationchange" : "resize"
    win.addEventListener(ev, fn)
    doc.addEventListener("DOMContentLoaded", fn)

    function fn () {
        let clientW = doc.documentElement.clientWidth
        let rem = clientW / 375 * 50 + "px"
        doc.documentElement.style.fontSize = rem
    }

})(document, window)