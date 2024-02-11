var cssRules = '.code.javascript {color:#d4d4d4;background-color: #1e1e1e;padding: 0.5em;margin: 0.5em 0;border-radius: 0.25em;overflow: auto;} .code.javascript .sy0 { color: #dcdcaa;}  .code.javascript .kw1 {color: #569cd6; }  .code.javascript .nu0 { color: #b5cea8;}  .code.javascript .br0 {color: #569cd6; } .code.javascript .co1 { color: #57a64a; }  .code.javascript .st0 { color: #d69d85;} .code.html {color:#d4d4d4;background-color: #1e1e1e;padding: 0.5em;margin: 0.5em 0;border-radius: 0.25em;overflow: auto;}  .code.html .sc2 {  } .code.html .kw2 { color: #569cd6;} .code.html .kw3 { color: #569cd6;} .code.html .sy0 { } .code.html .st0 { color: #d69d85;} .code.html .sc-1 { color: #57a64a;}  .code.css {color:#d4d4d4;background-color: #1e1e1e;padding: 0.5em;margin: 0.5em 0;border-radius: 0.25em;overflow: auto;} .code.css .co1 { color: #57a64a; } .code.css .sy0 {} .code.css .re1 { color: #569cd6;} .code.css .kw1 {color:orange;} .code.css .kw2 {} div.cp2clipcont {position: relative;margin:0;padding:0;overflow: auto;border:none;} div.cp2clipcont button {position: absolute; top: 0; right: 0;} .cp2clipmsg {top: 50px;left: 50%;transform: translate(-50%,0);position: fixed;padding: .7em;border-radius: 7px;font-size: 1.5rem;} #cp2clipok {background: #00ff00; color: #111;} #cp2clipnok {background: #c71585; color: #ccc;}';
var styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(cssRules));
document.getElementsByTagName('head')[0].appendChild(styleElement);
document.addEventListener('DOMContentLoaded', function () {
    if (!navigator.clipboard)
        return;

    // messageBox( 'id', 'text' ); flash a message at top of screen
    var messageBox = function (id, txt) {
        const body = document.getElementsByTagName('body')[0];
        const msg = document.createElement('div');
        msg.setAttribute('id', id);
        msg.classList.add('cp2clipmsg');
        const content = document.createTextNode(txt);
        msg.appendChild(content);
        body.appendChild(msg);
        window.setTimeout(function () {
            var element = document.getElementById(id);
            element.style.transition = "opacity 0.5s, height 0.5s";
            element.style.opacity = 0;
            element.style.height = "0";
        
            // After the animation, remove the element from the DOM
            setTimeout(function () {
                element.remove();
            }, 500);
        }, 1500);
    };      
    // true on MS windows. used to set EOL
    var iswin = (navigator.appVersion.indexOf("Win") != -1);

    // The async function that responds to click event
    var response = async function (event) {
        try {
            let text = '';
            // when line numbers are on, geshi uses <li> tag for each line
            let lis = event.target.previousSibling.getElementsByTagName('li');
            if (lis.length) {
                for (let li of lis) {
                    text += li.textContent + '\n';
                }
            }
            // no line numbers, whole text is directly in <pre> tag
            else {
                text = event.target.previousSibling.textContent;
                text = text.replace(/\r\n/g, '\n'); // can happen if page files are prepared on win and dropped in doku tree...
            }
            // Why replace \u00A0 ??? geshi adds an NBSP on each empty line. This is an issue
            // with python, perl... when you want to run copied code, you get a
            // syntax error "unexpected \xC2 character" or similar... So remove this
            // crap. And yes, it could remove a legitimate NBSP; chances are low though.
            text = text.replace(/^\u00A0$/gm, "");
            // if you paste \n separated lines with the right button in PowerShell, the lines are
            // fed in reverse order! Most stupidly funny bug by MS ever. Anyway, just make sure
            // we use \r\n separated lines under windows. It just makes sense.
            // see powershell bugs https://github.com/PowerShell/PowerShell/issues/3816 and
            // https://github.com/PowerShell/PSReadLine/issues/496 or
            // https://github.com/PowerShell/PSReadLine/issues/579, they're all the same...
            if (iswin) {
                text = text.replace(/\n/g, '\r\n');
            }
            await navigator.clipboard.writeText(text);
            messageBox('cp2clipok', "fragment copiat!");
        } catch (err) {
            messageBox('cp2clipnok', "error");
        }
    };

    // iterate over all <pre> nodes and create the needed structure.
    // <pre>...</pre> ==> <div class="cp2clipcont"><pre>...</pre><button /></div>
    let sup = 'desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        sup = 'mobile';
    let classes = ['cp2clipcont', sup];
    document.querySelectorAll('pre.code,pre.file').forEach(function (elem) {
        // wrap the current node in a div. See https://stackoverflow.com/a/46595686/1831273
        let container = document.createElement('div');
        container.classList.add(...classes);
        elem.parentNode.insertBefore(container, elem);
        elem.previousElementSibling.appendChild(elem);

        let cpbutton = document.createElement('button');
        cpbutton.setAttribute('title', "copia aquest fragment de codi");
        cpbutton.innerHTML = "copia";
        cpbutton.addEventListener("click", () => {
            cpbutton.blur(); // removes the focus
        })
        // In order to maintain vertical alignment use the margin-top of the <pre>
        // elem for the container and set the <pre> elem margin-top to 0.
        let marginTop = window.getComputedStyle(elem)['margin-top'];
        if (marginTop != "0px") {
            container.style['margin-top'] = marginTop;
            elem.style['margin-top'] = 0;
        }
        // Do the same for margin-bottom.
        let marginBottom = window.getComputedStyle(elem)['margin-bottom'];
        if (marginBottom != "0px") {
            container.style['margin-bottom'] = marginBottom;
            elem.style['margin-bottom'] = 0;
        }
        container.appendChild(cpbutton);
        cpbutton.addEventListener('click', response);
    });
});
