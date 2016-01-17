(function forumUpdater(window) {
    if (document.readyState !== "complete") {
        setTimeout(forumUpdater, 500, window);
        return false;
    }

    // for use below, they need to be defined globally
    var cannedResponses,
        CRListElm, CRContainer,
        ebb;

    // get the canned responses
    function initializeCRArray() {
        if (!localStorage.getItem("canned_responses")) {
            cannedResponses = [];
            localStorage.setItem("canned_responses", JSON.stringify(cannedResponses));
        }

        cannedResponses = JSON.parse(localStorage.getItem("canned_responses"));
    }

    function insertCRContainer() {
        CRContainer = document.createElement("DIV");
        CRContainer.setAttribute("id", "canned-response-container");
        CRContainer.setAttribute("class", "canned-response-container");
        ebb.appendChild(CRContainer);
    }

	function getNewCRBtn() {
        var li = document.createElement("LI"),
            span = document.createElement("SPAN");

        li.setAttribute("id", "new-canned-response");
        span.innerHTML = "Create new canned response";

        li.appendChild(span);

        return li;
    }
	
    function insertCRListElm() {
        initializeCRArray();

        CRListElm = document.createElement("ul");
        var btn = getNewCRBtn();

        CRListElm.setAttribute("id", "canned-responses-list");
        CRListElm.appendChild(btn);

        CRContainer.appendChild(CRListElm);
      
        for (i in cannedResponses) {
          currentCR = cannedResponses[i]
          insertNewCRInList(currentCR["name"], currentCR["body"], i)
        }
    }

    // generate the list of canned responses
    function insertNewCRInList(name, body, id) {
        var li = document.createElement("LI"),
            spanName = document.createElement("SPAN"),
            spanDel = document.createElement("SPAN");

        spanName.innerHTML = name;
        spanName.classList.add("name");
        spanDel.classList.add("fa");
        spanDel.classList.add("fa-trash");

        li.appendChild(spanName);
        li.appendChild(spanDel);
        CRListElm.appendChild(li);
    }

    // add the canned response button to the formatting bar
    function addCannedResponseButton() {
        ebb.innerHTML += '<div class=\"d-editor-spacer\"></div><button class=\"ember-view btn no-text canned-response\" id=\"canned-response-button\" title=\"Canned responses\" aria-label=\"Canned responses\"><i class=\"fa fa-pencil-square-o\"></i></button>'
    }

    // create a new canned response
    function newCannedResponse() {
        var textarea = qS("textarea"),
            start = textarea.selectionStart,
            end = textarea.selectionEnd,
            cannedResponseText = textarea.value.substring(start, end),
            cannedResponseName = prompt("Please name your canned response:", cannedResponseText.slice(0, 10) + "...");

        CRContainer.toggle();
        ebb.toggleClass("active");

        if (!cannedResponseName)
            return false;        
		
        cannedResponses.push({
            "name": cannedResponseName,
            "body": cannedResponseText
        });
		
        localStorage.setItem("canned_responses", JSON.stringify(cannedResponses));

        insertNewCRInList(cannedResponseName, cannedResponseText);
    }

    function prefillWithCannedResponse(text) {
        qS('.d-editor-input').value += text;
        CRContainer.hide();
        ebb.removeClass("active");
    }

    // delete a canned response
    function deleteCannedResponse(node) {
        var li = node.parentNode,
            index = [].indexOf.call(CRListElm.children, node);

        cannedResponses.splice(index, 1);

        localStorage.setItem("canned_responses", JSON.stringify(cannedResponses));

        CRListElm.removeChild(li);
        CRContainer.hide();
        ebb.removeClass("active");
    }

    // collect all the other functions together and run them
    function runTheCannedResponseFunctions() {
        ebb = qS('.d-editor-button-bar');
		
        addCannedResponseButton();
        insertCRContainer();
        insertCRListElm();
        CRContainer.hide();

        qS('#new-canned-response').addEventListener("click", newCannedResponse);

        // one stop shop for canned response and delete button
        CRListElm.addEventListener("click", function(ev) {
            var node = ev.target,
                tgN = node.tagName,
				index;

            if (tgN === "LI"){
				index = [].indexOf.call(CRListElm.children, node) - 1;
                prefillWithCannedResponse(cannedResponses[index].body);
			}
            else if (tgN === "SPAN")
                deleteCannedResponse(node);
        });

        qS('#canned-response-button').addEventListener("click", function() {
            CRContainer.toggle();
            ebb.toggleClass("active");
        });
    };

    // detect when the text box is popped up, then run
    var target = qS('#reply-control'),
        config = {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        },
		observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var dep = qS('.d-editor-preview'),
                crb = qS('#canned-response-button');

            if (!crb) {
                dep.addClass('cooked');

                runTheCannedResponseFunctions();
            }
        });
    });

    observer.observe(target, config);

    /* New Exercise Button*/

    var lessonType1 = "Python, Ruby, JavaScript, HTML & CSS, PHP, jQuery, Make an Interactive Website, Make a Website, Goals, APIs",
        lessonType2 = "Learn the Command Line, Learn Java, Ruby on Rails: Authentication, Learn AngularJS, Learn SQL, Learn Git, Learn Rails, Make an Interactive Website: Projects, Make a Website: Projects",
        forumPostRegex = /discuss.codecademy.com\/t/,
        pageURL = window.location.href;

    btnInjection();
    // whenever we click on one forum post, it doesn't
    // reload the page, just changes the URL using AJAX
    // hence the need for this function
    setInterval(checkURLChange, 1000);

    function checkURLChange() {
        var newPageURL = window.location.href;

        if (newPageURL !== pageURL) {
            pageURL = newPageURL;

            // wait for page to load before executing btnInjection
            var interval = setInterval(function() {
                if (document.readyState === "complete") {
                    try {
                        btnInjection();
                        clearInterval(interval);
                    } catch (e) {}
                }
            }, 50);
        }
    }

    function btnInjection() {
        if (!forumPostRegex.test(pageURL)) return;

        var category = qS(".title-wrapper .badge-wrapper.bullet:first-child .badge-category").innerText,
            hrefElmAll = qSAll("a.badge-wrapper.bullet"),
            hrefElm = hrefElmAll[hrefElmAll.length - 1],
            href = hrefElm.getAttribute("href").split("/"),
            URL = "https://www.codecademy.com/courses/";

        if (lessonType1.indexOf(category) > -1)
            URL += href[3];
        else if (lessonType2.indexOf(category) > -1)
            URL += href[2] + "#unit_" + href[3];

        // meta or lounge categories with no linked forums
        else URL = "";

        var a, img, container, span;

        if (URL !== "") {
            try {
                container = document.querySelector(".title-wrapper > .ember-view .list-tags");

                // link already exists
                if (container.querySelector(".new_tab_exercise_link") !== null) return;

                span = document.createElement("span"); // just to add some spacing from tag list
                a = document.createElement("a");
                i = document.createElement("i");

                a.href = URL;
                a.target = "_blank";
                a.classList.add("new_tab_exercise_link");

                i.id = "external-link-button";
                i.classList.add("fa", "fa-external-link");
                i.title = "Open exercise in new tab";

                span.innerHTML = "&nbsp;";

                a.appendChild(i);
                container.appendChild(span);
                container.appendChild(a);
            } catch (e) {
                console.error(e);
            }
        }
    }

    // userButton.js; not every discuss page is user page. So, try-block is needed
    try {
        var id = chrome.runtime.id,
            elm = qS(".user-main .about .details .primary h1"),
            url = "https://www.codecademy.com/" + elm.innerHTML.split("<")[0];

        elm.insertAdjacentHTML("beforeend", "<a target='_blank' href=" + url + "> <img id='userLink' src='chrome-extension://" + id + "/ntwhite.png' alt='CC Profile' title='Opens the users&#39; CC Profile'/> </a>");
        document.body.insertAdjacentHTML("afterend", '<style>#userLink{height: 20px;width: 20px;margin-top: -5px;}#userLink:hover {	cursor: pointer;content:url("chrome-extension://' + id + '/ntgreen.png");}</style>');
    } catch (e) {
        console.log("Error", e);
    }
})(window);