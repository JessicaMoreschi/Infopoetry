// TOGGLE INFO PANEL |––––––––––––––––––––––––––––––––––––––––––
function openHelp() {
    let w = document.getElementById('main-container')
    if (w.style.width == '100%') {
        w.style.width = 'calc(100% - 500px)'
    } else { w.style.width = '100%' }
}

// SCROLLING TEXT |––––––––––––––––––––––––––––––––––––––––––
let leftValue = 0
function text(msg, ctrlwidth) {
    msg = "  ●  " + msg
    newmsg = msg
    while (newmsg.length < ctrlwidth) {
        newmsg += msg
    }
    document.write('<FORM NAME="Scrolltext">');
    document.write('<INPUT id="runningTxt" NAME="text" VALUE= "' + newmsg + '" SIZE= ' + ctrlwidth + ' disabled>');
    document.write('</FORM>');
    rollmsg()
}
function rollmsg() {
    leftValue += 5
    document.getElementById('runningTxt').scrollTo({
        top: 0,
        left: leftValue,
        behavior: 'smooth'
    });
    bannerID = setTimeout("rollmsg()", 100)
}

msg = "Studying at university"
ctrlwidth = innerWidth
text(msg, ctrlwidth);