var win = navigator.platform.indexOf('Win') > -1;
if (win && document.querySelector('#sidenav-scrollbar')) {
    var options = {
        damping: '0.5'
    }
    Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
}

function takedatarelay() {
    var http = new XMLHttpRequest();
    http.open("GET", "http://127.0.0.1:1887/GetStatusRelay", true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            datarelay = data;
            createbutton();
        }
    }
}

function SendCommand(address) {
    var http = new XMLHttpRequest();
    http.open("GET", "http://127.0.0.1:1887/SendCommand?address=" + String(address), true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            takedatarelay();
            createbutton();
        }
    }
}
function datasensor() {
    var http = new XMLHttpRequest();
    http.open("GET", "http://127.0.0.1:1887/GetCurrent", true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            var len = data.length;
            main(data, len);
        }
    }
}
function Upper(data, len) {
    document.getElementById("tbdproduct").placeholder = data[data.length - 1].Turbidity_Product;
    document.getElementById("TBDSA").placeholder = data[data.length - 1].Turbidity_Sedimentation_A;
    document.getElementById("TBDSB").placeholder = data[data.length - 1].Turbidity_Sedimentation_B;
}
function main(data, len) {
    Upper(data, len);
}
function start() {
    takedatarelay();
    datasensor()
}
start();

function toggleMode(option, thisID, otherID, nID) {
    var url = "http://127.0.0.1:1887/getFilterMode?";
    if (option === 'A') {
        document.getElementById(otherID).checked = false;
        document.getElementById("AutoF" + nID).style.display = "block";
        document.getElementById("ManualF" + nID).style.display = "none";
        url = url + "ID=" + thisID + "&Mode" + "=1"
    } else if (option === 'B') {
        document.getElementById(otherID).checked = false;
        document.getElementById("AutoF" + nID).style.display = "none";
        document.getElementById("ManualF" + nID).style.display = "block";
        url = url + "ID=" + thisID + "&Mode" + "=0"
    }

    var http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.send();
}

function btnCheck(buttonId) {
    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Getting Data";
    var buttonElement = document.getElementById(buttonId);
    var originalColor = buttonElement.style.backgroundColor;
    var originalText = buttonElement.textContent;
    var inputIds = [];
    inputIds.push(buttonId.substr(0, 3) + "_BLO_input");
    inputIds.push(buttonId.substr(0, 3) + "_BWS_input");

    document.querySelectorAll("button").forEach(function (buttonElement) {
        buttonElement.disabled = true;
    })
    setTimeout(() => {
        document.querySelectorAll("button").forEach(function (buttonElement) {
            buttonElement.disabled = false;
        })

    }, 500)

    buttonElement.style.backgroundColor = "#945e21";
    buttonElement.innerHTML = '<i class="btn bx bxs-bolt-circle bx-flashing btn-loading-icon"></i>';
    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/CheckBackwash?ID=" + buttonId;
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var data = JSON.parse(this.responseText);
            setTimeout(function () {
                document.getElementById(inputIds[0]).value = data.BLO;
                document.getElementById(inputIds[1]).value = data.BWS;
                if (data.Stat) {
                    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Checked";
                } else {
                    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Check Failed";
                }
                buttonElement.style.backgroundColor = originalColor;
                buttonElement.textContent = originalText;
            }, 500);
        }
    }
}

function btnSubmit(buttonId) {
    var buttonElement = document.getElementById(buttonId);
    var originalColor = buttonElement.style.backgroundColor;
    var originalText = buttonElement.textContent;
    var inputIds = [];
    inputIds.push(buttonId.substr(0, 3) + "_BLO_input");
    inputIds.push(buttonId.substr(0, 3) + "_BWS_input");
    var data = [];
    var validationFailed = false;
    inputIds.forEach(function (id) {
        var inputValue = document.getElementById(id).value;
        data.push(parseInt(inputValue));
        if (!inputValue || parseFloat(inputValue) === 0) {
            validationFailed = true;
            return;
        }
    });

    if (validationFailed) {
        Swal.fire({
            icon: 'error',
            title: 'Submit Failed!',
            text: 'Ensure that the duration inputs are not empty or zero.',
        });
        return;
    }

    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Submitting";
    document.querySelectorAll("button").forEach(function (buttonElement) {
        buttonElement.disabled = true;
    })
    setTimeout(() => {
        document.querySelectorAll("button").forEach(function (buttonElement) {
            buttonElement.disabled = false;
        })

    }, 500)

    buttonElement.style.backgroundColor = "#391e75";
    buttonElement.innerHTML = '<i class="btn bx bxs-bolt-circle bx-flashing btn-loading-icon"></i>';
    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/SettingBackwash?ID=" + buttonId + "&Data=" + JSON.stringify(data);
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var data = JSON.parse(this.responseText);
            setTimeout(function () {
                if (data.Stat) {
                    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Submitted";
                } else {
                    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Submit Failed";
                }
                buttonElement.style.backgroundColor = originalColor;
                buttonElement.textContent = originalText;
            }, 500);
        }
    }
}

function btnStop(buttonId) {
    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Stopping";
    var buttonElement = document.getElementById(buttonId);
    var originalColor = buttonElement.style.backgroundColor;
    var originalText = buttonElement.textContent;
    document.querySelectorAll("button").forEach(function (buttonElement) {
        buttonElement.disabled = true;
    })
    setTimeout(() => {
        document.querySelectorAll("button").forEach(function (buttonElement) {
            buttonElement.disabled = false;
        })

    }, 500)
    buttonElement.style.backgroundColor = "#75195e";
    buttonElement.innerHTML = '<i class="btn bx bxs-bolt-circle bx-flashing btn-loading-stop"></i>';

    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/StopBackwash?ID=" + buttonId;
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var data = JSON.parse(this.responseText);
            setTimeout(function () {
                if (data.Stat) {
                    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Stopped";
                } else {
                    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Stop Failed";
                }
                buttonElement.style.backgroundColor = originalColor;
                buttonElement.textContent = originalText;
            }, 500);
        }
    }
}

function btnRun(buttonId) {
    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Starting";
    var buttonElement = document.getElementById(buttonId);
    var originalColor = buttonElement.style.backgroundColor;
    var originalText = buttonElement.textContent;
    document.querySelectorAll("button").forEach(function (buttonElement) {
        buttonElement.disabled = true;
    })
    setTimeout(() => {
        document.querySelectorAll("button").forEach(function (buttonElement) {
            buttonElement.disabled = false;
        })

    }, 500)
    buttonElement.style.backgroundColor = "#21612c";
    buttonElement.innerHTML = '<i class="btn bx bxs-bolt-circle bx-flashing btn-loading-run"></i>';

    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/RunBackwash?ID=" + buttonId;
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var data = JSON.parse(this.responseText);
            setTimeout(function () {
                if (data.Stat) {
                    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Running";
                } else {
                    document.getElementById(buttonId.substring(0, 3) + "_status").placeholder = "Run Failed";
                }
                buttonElement.style.backgroundColor = originalColor;
                buttonElement.textContent = originalText;
            }, 500);
        }
    }
}

function btnInlet(buttonId) {
    updateFlag = false;
    var buttonElement = document.getElementById(buttonId);
    var originalColor = buttonElement.style.backgroundColor;
    document.querySelectorAll("button").forEach(function (buttonElement) {
        buttonElement.disabled = true;
    })
    setTimeout(() => {
        document.querySelectorAll("button").forEach(function (buttonElement) {
            buttonElement.disabled = false;
        })

    }, 4500)
    buttonElement.style.backgroundColor = "#f75e05";
    buttonElement.style.color = "#fff";
    buttonElement.innerHTML = '<i class="btn bx bxs-bolt-circle bx-flashing btn-loading-run"></i>';

    if (originalColor === "rgb(94, 114, 228)") {
        var action = 1;
    } else if (originalColor === "rgb(0, 247, 21)") {
        var action = 0;
    }
    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/InletManual?ID=" + buttonId + "&action=" + action;
    http.open("GET", url, true);
    http.send();
    setTimeout(function () {
        updateFlag = true;
        updateButton();
    }, 4500);
}

function btnDrain(buttonId) {
    updateFlag = false;
    var buttonElement = document.getElementById(buttonId);
    var originalColor = buttonElement.style.backgroundColor;
    document.querySelectorAll("button").forEach(function (buttonElement) {
        buttonElement.disabled = true;
    })
    setTimeout(() => {
        document.querySelectorAll("button").forEach(function (buttonElement) {
            buttonElement.disabled = false;
        })

    }, 4500)
    buttonElement.style.backgroundColor = "#f75e05";
    buttonElement.style.color = "#fff";
    buttonElement.innerHTML = '<i class="btn bx bxs-bolt-circle bx-flashing btn-loading-valve"></i>';

    if (originalColor === "rgb(94, 114, 228)") {
        var action = 1;
    } else if (originalColor === "rgb(0, 247, 21)") {
        var action = 0;
    }

    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/DrainManual?ID=" + buttonId + "&action=" + action;
    http.open("GET", url, true);
    http.send();
    setTimeout(function () {
        updateFlag = true;
        updateButton();
    }, 4500);
}

function btnOutlet(buttonId) {
    updateFlag = false;
    var buttonElement = document.getElementById(buttonId);
    var originalColor = buttonElement.style.backgroundColor;
    document.querySelectorAll("button").forEach(function (buttonElement) {
        buttonElement.disabled = true;
    })
    setTimeout(() => {
        document.querySelectorAll("button").forEach(function (buttonElement) {
            buttonElement.disabled = false;
        })

    }, 4500)
    buttonElement.style.backgroundColor = "#f75e05";
    buttonElement.style.color = "#fff";
    buttonElement.innerHTML = '<i class="btn bx bxs-bolt-circle bx-flashing btn-loading-valve"></i>';

    if (originalColor === "rgb(94, 114, 228)") {
        var action = 1;
    } else if (originalColor === "rgb(0, 247, 21)") {
        var action = 0;
    }

    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/OutletManual?ID=" + buttonId + "&action=" + action;
    http.open("GET", url, true);
    http.send();
    setTimeout(function () {
        updateFlag = true;
        updateButton();
    }, 4500);
}

function btnBlower(buttonId) {
    updateFlag = false;
    var buttonElement = document.getElementById(buttonId);
    var originalColor = buttonElement.style.backgroundColor;
    document.querySelectorAll("button").forEach(function (buttonElement) {
        buttonElement.disabled = true;
    })
    setTimeout(() => {
        document.querySelectorAll("button").forEach(function (buttonElement) {
            buttonElement.disabled = false;
        })

    }, 4500)
    buttonElement.style.backgroundColor = "#f75e05";
    buttonElement.style.color = "#fff";
    buttonElement.innerHTML = '<i class="btn bx bxs-bolt-circle bx-flashing btn-loading-valve"></i>';

    if (originalColor === "rgb(94, 114, 228)") {
        var action = 1;
    } else if (originalColor === "rgb(0, 247, 21)") {
        var action = 0;
    }

    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/BlowerManual?ID=" + buttonId + "&action=" + action;
    http.open("GET", url, true);
    http.send();
    setTimeout(function () {
        updateFlag = true;
        updateButton();
    }, 4500);
}

function btnBackwash(buttonId) {
    updateFlag = false;
    var buttonElement = document.getElementById(buttonId);
    var originalColor = buttonElement.style.backgroundColor;
    document.querySelectorAll("button").forEach(function (buttonElement) {
        buttonElement.disabled = true;
    })
    setTimeout(() => {
        document.querySelectorAll("button").forEach(function (buttonElement) {
            buttonElement.disabled = false;
        })

    }, 4500)
    buttonElement.style.backgroundColor = "#f75e05";
    buttonElement.style.color = "#fff";
    buttonElement.innerHTML = '<i class="btn bx bxs-bolt-circle bx-flashing btn-loading-valve"></i>';

    if (originalColor === "rgb(94, 114, 228)") {
        var action = 1;
    } else if (originalColor === "rgb(0, 247, 21)") {
        var action = 0;
    }

    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/BackwashManual?ID=" + buttonId + "&action=" + action;
    http.open("GET", url, true);
    http.send();
    setTimeout(function () {
        updateFlag = true;
        updateButton();
    }, 4500);
}

var updateFlag = true;
function updateButton() {
    if (updateFlag) {
        var http = new XMLHttpRequest();
        var url = "http://192.168.137.137:1887/UpdateButton?";
        http.open("GET", url, true);
        http.send();
        http.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var data = JSON.parse(this.responseText);
                var btnID = ['FI_INL', 'FI_OTL', 'FI_DRA', 'FI_BLO', 'FI_BWS'];
                var btnNM = ['Inlet', 'Outlet', 'Drain', 'Blower', 'Backwash'];

                for (var i = 0; i < 4; i++) {
                    for (var j = 0; j < 5; j++) {
                        buttonElement = document.getElementById(btnID[j].slice(0, 2) + (i + 1) + btnID[j].slice(2));
                        if (data[i][j] === 1) {
                            buttonElement.style.backgroundColor = "rgb(0, 247, 21)";
                            buttonElement.textContent = btnNM[j];
                        } else if (data[i][j] === 0) {
                            buttonElement.style.backgroundColor = "rgb(94, 114, 228)";
                            buttonElement.textContent = btnNM[j];
                        }
                    }
                }

            }
        }
    }
}

setInterval(updateButton, 1000);

function updateSensor() {
    var http = new XMLHttpRequest();
    var url = "http://192.168.137.137:1887/UpdateSensor?";
    http.open("GET", url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var data = JSON.parse(this.responseText);
            var inputIds = [];
            var inputIds2 = [];
            for (var i = 1; i <= 8; i++) {
                inputIds.push("FI" + [i] + "_low");
                inputIds2.push("FI" + [i] + "_high");
            }
            inputIds.forEach(function (id) {
                document.getElementById(id).hidden = !data[`Filter${id[2]}L`];
            });
            inputIds2.forEach(function (id) {
                document.getElementById(id).hidden = !data[`Filter${id[2]}H`];
            });
        }
    }
}
updateSensor();
setInterval(updateSensor, 1000);
