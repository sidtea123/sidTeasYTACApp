var bps = 0;
setInterval(updateCPS,1000);
setInterval(save,30000);

self.onmessage = function(event) {
    bps = event.data.bps;
};

function updateCPS() {
    postMessage(bps);
}

function save() {
    postMessage(-1)
}