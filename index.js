let slideValue = 0;

function openHelp() {
    let w = document.getElementById('main-container')
    if (w.style.width == '100%') {
        w.style.width = 'calc(100% - 500px)'
    } else { w.style.width = '100%' }
}