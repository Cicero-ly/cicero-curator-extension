let form = document.getElementById("authForm");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    
    let curatorEmailInput = document.getElementById("curatorEmailInput").value;
    let curatorPassInput = document.getElementById("curatorPassInput").value;
    
    let authRequest = `https://api.cicero.ly/admin/curator/get-auth-status?curatorEmail=${curatorEmailInput}&curatorPass=${curatorPassInput}&extensionPass=9saGbMoDek4yLjQKJfqyh9fAgAdKhwH8HQX8LUjh6pQjsuVdPt`;
    fetch(authRequest, { method: "get" })
    .then(res => {
        if (res.ok) {
            res.json()
            .then(body => console.log(body));

            setLocalStorage({
                email: curatorEmailInput,
                password: curatorPassInput
            });

            document.getElementById("auth_status").style.color = "green";
            document.getElementById("auth_status").innerHTML = "Successfully logged in";
        }
    })
    .catch(e => {
        document.getElementById("auth_status").style.color = "red";
        document.getElementById("auth_status").innerHTML = "Authentication failed";
        console.error(e);
        setLocalStorage({});
    })
})

function setLocalStorage(obj) {
    if (Object.keys(obj).length === 0) {
        chrome.storage.sync.set({}, () => {
            console.log('localStorage cleared');
            chrome.storage.sync.get('ciceroUser', data => {
                console.log(data);
            })
        })
        return;
    }
    chrome.storage.sync.set({ ciceroUser: { email: obj.email, password: obj.password } }, () => {
        console.log('localStorage successfully set');
        chrome.storage.sync.get('ciceroUser', data => {
            console.log(data);
        })
    })
}

let shortcutLink = document.getElementById("shortcut-link");
shortcutLink.addEventListener("click", event => {
    chrome.tabs.create({
        url: 'chrome://extensions/shortcuts'
    });
})