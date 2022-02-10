let form = document.getElementById("authForm");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    
    let curatorEmailInput = document.getElementById("curatorEmailInput").value;
    let curatorPassInput = document.getElementById("curatorPassInput").value;
    
    let authRequest = `https://dev-api.cicero.ly/admin/curator/get-auth-status?curatorEmail=${curatorEmailInput}&curatorPass=${curatorPassInput}&pass=AyEDyX%268%26YXx8qhSuX2%23TGURb9SAjxkMjpfG!%5E6aCcg%23H3!dTwCuPoDD%23dMWvJN6%40S%24Je`;
    fetch(authRequest, { method: "get" })
    .then(res => {
        if (res.ok) {
            res.json()
            .then(body => console.log(body));

            setLocalStorage({
                email: curatorEmailInput,
                password: curatorPassInput
            });
            // todo: this isnt working as expected
        } else if (res.status === 401) {
            console.error('Unauthorized');
            setLocalStorage({});
        } else {
            console.error(res.status);
        }
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
    }
    chrome.storage.sync.set({ ciceroUser: { email: obj.email, password: obj.password } }, () => {
        console.log('localStorage successfully set');
        chrome.storage.sync.get('ciceroUser', data => {
            console.log(data);
        })
    })
}