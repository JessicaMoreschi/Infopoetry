document.getElementsByClassName('tutorial')[0].style.left = 'calc(50% - '+window.innerHeight/1.6+'px)'
document.getElementById('canvas').addEventListener('wheel',function(){ document.getElementById('tutorial2').style.display='none'})

// TOGGLE INFO PANEL |––––––––––––––––––––––––––––––––––––––––––

function openHelp() {
    let w = document.getElementById('main-container')
    if (w.style.width == '100%') {
        w.style.width = 'calc(100% - 500px)';
        document.getElementsByClassName('tutorial')[0].style.left = 'calc(50% - '+window.innerHeight/1.6+'px - 500px)'
        document.getElementsByClassName('info-container')[0].scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    } else { w.style.width = '100%'; document.getElementsByClassName('tutorial')[0].style.left = 'calc(50% - '+window.innerHeight/1.6+'px)' }
}

// SCROLLING TEXT |––––––––––––––––––––––––––––––––––––––––––

let leftValue = 0
let updMsg = 'taking the train'
function text(msg, ctrlwidth) {
    msg = "  ●  " + msg
    newmsg = msg
    while (newmsg.length < ctrlwidth) {
        newmsg += msg
    }
    document.write('<FORM NAME="Scrolltext">');
    document.write('<INPUT id="runningTxt" NAME="text" VALUE= "' + newmsg + '" SIZE= ' + ctrlwidth + ' disabled>');
    document.write('</FORM>');
    rollmsg(updMsg)
}
function rollmsg(msg) {
    updMsg=msg
    leftValue += 5
    document.getElementById('runningTxt').scrollTo({
        top: 0,
        left: leftValue,
        behavior: 'smooth'
    });
        msg = "  ●  " + msg
        newmsg = msg
        while (newmsg.length < ctrlwidth) {
            newmsg += msg
        }
        document.getElementById('runningTxt').attributes[2].value = newmsg
        setTimeout("rollmsg(updMsg)", 100)
}

msg = 'taking the train'
ctrlwidth = innerWidth
text(msg, ctrlwidth);
