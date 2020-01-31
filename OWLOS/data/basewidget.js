﻿var WORK_MODE = 0;
var MOVE_MODE = 1;

var EVENT_NO = 0;
var EVENT_DELETE = 1;

function defaultWidgetProperties() {
    return {
        headertext: {
            tab: "G",
            value: "---",
            type: "s"
        },

        headercolor: {            
            tab: "C",
            value: theme.secondary,
            type: "c"
        },

        headeropacity: {            
            tab: "O",
            value: 0.1,
            type: "f"
        },

        backgroundcolor: {            
            tab: "C",
            value: theme.dark,
            type: "c"
        },

        backgroundopacity: {            
            tab: "O",
            value: 1.0,
            type: "f"
        },

        bordercolor: {            
            tab: "C",
            value: theme.secondary,
            type: "c"
        },

        backgroundselectopacity: {            
            tab: "O",
            value: 0.2,
            type: "f"
        },

        valuetextcolor: {            
            tab: "C",
            value: theme.secondary,
            type: "c"
        },

        showequalizer: {            
            tab: "G",
            value: 'false',
            type: "b"
        }

    }
}

var BaseWidget =

    function () {
        "use strict";

        function BaseWidget(parentPanel, id, size) {
            this.parentPanel = parentPanel;

            this.id = id;
            this._networkStatus = NET_OFFLINE;
            this._event = EVENT_NO;
            this.mouseEnter = false;
            this.eventListners = [];

            this.widgetHolder = this.parentPanel.appendChild(document.createElement("div"));
            this.widgetHolder.id = id + "BaseWidget";
            this.widgetHolder.widget = this;
            this.widgetHolder.className = "col-sm-1";
            this.widgetHolder.style.cursor = "pointer";
            this.widgetHolder.onmouseover = this.mouseOver;
            this.widgetHolder.onmouseout = this.mouseOut;

            waitForElement(this.widgetHolder, this.onrPanelLoad);

            var body = document.getElementsByTagName("BODY")[0];
            body.onresize = this.onPanelResize;
            if (body.widget == undefined) {
                body.widget = [];
            }
            body.widget.push(this);

        }

        BaseWidget.prototype.onrPanelLoad = function onrPanelLoad(event) {
            var rPanel = event.currentTarget;
            var widget = rPanel.widget;

            widget.size = widget.widgetHolder.clientWidth;

            widget.panding = widget.size / 25;
            widget.halfPanding = widget.panding / 2;

            widget.radius = widget.size / 7;
            widget.width = widget.size - widget.halfPanding;
            widget.height = widget.size - widget.halfPanding;
            widget.topMargin = widget.height / 20;
            widget.centreX = widget.width / 2 + widget.panding / 2;
            widget.centreY = widget.height / 2;


            widget.svgElement = document.createElementNS(xmlns, "svg");
            widget.svgElement.setAttributeNS(null, "viewBox", "0 " + "0 " + widget.size + " " + widget.size);
            widget.resize(widget.size);
            widget.svgElement.style.display = "block";

            widget.SVGBackpanel = new SVGArc(widget.svgElement, widget.id + "backpanel", 0, 0, widget.width, 1);
            widget.SVGBackpanel.drawRoundedRect(widget.width, widget.height, 5, 10, true, true, true, true);
            
            widget.SVGBoxBackpanel = new SVGArc(widget.svgElement, widget.id + "boxbackpanel", 0, 0, widget.width, 1);
            widget.SVGBoxBackpanel.drawRoundedRect(widget.width, 25, 5, 0, true, true, false, false);

            widget.SVGBackdownpanel = new SVGArc(widget.svgElement, widget.id + "backdownpanel", 0, widget.height - 10, widget.width, 1);
            widget.SVGBackdownpanel.drawRoundedRect(widget.width, 10, 5, 0, false, false, true, true);
            widget.SVGBackdownpanel.opacity = 0.5;
            widget.SVGBackdownpanel.fill = theme.secondary;


            widget.SVGWidgetText = new SVGText(widget.svgElement, widget.id + "widgettext", widget.size / 80);
            widget.SVGWidgetText.opacity = 0.7;
            widget.SVGWidgetText.color = theme.secondary;
            widget.SVGLabel = new SVGText(widget.svgElement, widget.id + "label", widget.size / 150);
            widget.SVGLabel.color = theme.secondary;
            widget.SVGHint = new SVGText(widget.svgElement, widget.id + "hint", widget.size / 150);
            widget.SVGHint.color = theme.secondary;


            var stop1 = document.createElementNS(xmlns, 'stop');
            stop1.setAttribute('stop-color', theme.info);
            stop1.setAttribute('stop-opacity', "0.7");
            stop1.setAttribute('offset', "0%");
            var stop2 = document.createElementNS(xmlns, 'stop');
            stop2.setAttribute('class', 'stop2');
            stop2.setAttribute('stop-color', theme.info);
            stop2.setAttribute('stop-opacity', "0.4");
            stop2.setAttribute('offset', "20%");
            var stop3 = document.createElementNS(xmlns, 'stop');
            stop3.setAttribute('class', 'stop3');
            stop3.setAttribute('stop-color', theme.info);
            stop3.setAttribute('stop-opacity', "0.0");
            stop3.setAttribute('offset', "60%");
            var gradient = document.createElementNS(xmlns, 'linearGradient');
            gradient.id = 'Gradient';
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            gradient.appendChild(stop3);
            widget.svgElement.appendChild(gradient);
            widget.SVGArcSpinner = new SVGArc(widget.svgElement, widget.id + "arcwidget", widget.centreX, widget.centreY + widget.topMargin, widget.size / 4, widget.size / 24);
            widget.SVGArcSpinner.color = 'url(#Gradient)';
            widget.SVGArcSpinner.opacity = 0.4; //equalizer 
            //width = 20 
            //height = 5

            widget.eCount = 30;
            widget.eWidth = widget.size / (widget.eCount + 50);
            widget.eRWidth = widget.width / 40;
            widget.eHeight = widget.eWidth;
            widget.eX = widget.width / 2 - widget.eWidth * 2 * widget.eCount / 2 + widget.halfPanding / 2 + 2;
            widget.eY = widget.height - widget.eHeight * 2 * 5 - 2;
            widget.equalizerX = []; //row

            for (var x = 0; x < widget.eCount; x++) {
                var equalizerY = [];

                for (var y = 0; y < 5; y++) {
                    var SVGEqualizerpanel = new SVGRect(widget.svgElement, widget.id + "backpanel", widget.eX + x * widget.eWidth * 2, widget.eY + y * widget.eHeight * 2, widget.eRWidth, widget.eRWidth);
                    SVGEqualizerpanel.opacity = 0.0;
                    SVGEqualizerpanel.fill = theme.secondary;

                    equalizerY.push(SVGEqualizerpanel);
                }

                widget.equalizerX.push(equalizerY);
            }

            widget.rowSize = widget.size / 6;
            widget.SVGLeftIcon = new SVGIcon(widget.svgElement, leftIcon, widget.panding, widget.height - widget.rowSize, widget.rowSize, widget.rowSize);
            widget.SVGLeftIcon.fill = theme.light;
            widget.SVGLeftIcon.SVGIcon.widget = widget;
            widget.SVGLeftIcon.SVGIcon.onclick = widget.moveLeft;
            widget.SVGLeftIcon.hide();
            widget.SVGRightIcon = new SVGIcon(widget.svgElement, rightIcon, widget.width - widget.rowSize, widget.height - widget.rowSize , widget.rowSize, widget.rowSize);
            widget.SVGRightIcon.fill = theme.light;
            widget.SVGRightIcon.SVGIcon.widget = widget;
            widget.SVGRightIcon.SVGIcon.onclick = widget.moveRight;
            widget.SVGRightIcon.hide();

            widget.SVGDeleteIcon = new SVGIcon(widget.svgElement, deleteIcon, widget.width - widget.rowSize + widget.size / 28, 0, widget.rowSize, widget.rowSize);
            widget.SVGDeleteIcon.fill = theme.light;
            widget.SVGDeleteIcon.SVGIcon.widget = widget;
            widget.SVGDeleteIcon.SVGIcon.onclick = widget.deleteWidgetClick;
            widget.SVGDeleteIcon.hide();

            widget.SVGPropertiesIcon = new SVGIcon(widget.svgElement, buildIcon, widget.width / 2 - widget.rowSize / 2, widget.height - widget.rowSize , widget.rowSize, widget.rowSize);
            widget.SVGPropertiesIcon.fill = theme.light;
            widget.SVGPropertiesIcon.SVGIcon.widget = widget;
            widget.SVGPropertiesIcon.SVGIcon.onclick = widget.propertiesClick;
            widget.SVGPropertiesIcon.hide();

            widget.widgetHolder.appendChild(widget.svgElement);

            widget._properties = defaultWidgetProperties();

            widget.resize(widget.widgetHolder.clientWidth);
            widget.mode = WORK_MODE;
        }



        BaseWidget.prototype.drawText = function drawText() {
            if (this._event == EVENT_DELETE) {
                return;
            }

            if (this.SVGWidgetText == undefined) return;

            //Widget text         
            this.SVGWidgetText.text = this.widgetText;

            if (this.SVGWidgetText.width != 0) {
                this.SVGWidgetText.x = this.centreX - this.SVGWidgetText.width / 2;
                this.SVGWidgetText.y = this.centreY + this.SVGWidgetText.height / 2;
            }

            switch (this._networkStatus) {
                case NET_ONLINE:
                    this.toColor(this.SVGWidgetText, this._properties.valuetextcolor.value);
                    break;

                case NET_ERROR:
                    this.toColor(this.SVGWidgetText, theme.danger);
                    break;

                case NET_RECONNECT:
                    this.toColor(this.SVGWidgetText, theme.info);
                    break;

                default:
                    //offline
                    this.toColor(this.SVGWidgetText, theme.secondary);
                    break;
            } //Label 

            if (this.SVGLabel.text !== this._properties.headertext.value) {
                this.SVGLabel.text = this._properties.headertext.value;
                if (this.SVGLabel.width > this.size) {
                    var coef = this.SVGLabel.width / (this._properties.headertext.value.length + 3);
                    var charCount = (this.size - this.size / 3) / coef;
                    this.SVGLabel.text = this._properties.headertext.value.slice(0, parseInt(charCount)) + "...";

                }
            }

            if (this.SVGLabel.width > 0) {
                this.SVGLabel.x = this.centreX - this.SVGLabel.width / 2;
                this.SVGLabel.y = this.SVGLabel.height;
            }


            switch (this._networkStatus) {
                case NET_ONLINE:
                    this.toColor(this.SVGLabel, theme.light);
                    break;

                case NET_ERROR:
                    this.toColor(this.SVGLabel, theme.danger);
                    break;

                case NET_RECONNECT:
                    this.toColor(this.SVGLabel, theme.info);
                    break;

                default:
                    //offline
                    this.toColor(this.SVGLabel, theme.secondary);
                    break;
            } //Hint


            switch (this._networkStatus) {
                case NET_ONLINE:
                    this.SVGHint.text = getLang("rid_online");
                    this.toColor(this.SVGHint, theme.success);
                    break;

                case NET_ERROR:
                    this.SVGHint.text = getLang("rid_error");
                    this.toColor(this.SVGHint, theme.danger);
                    break;

                case NET_RECONNECT:
                    this.SVGHint.text = getLang("rid_connect");
                    this.toColor(this.SVGHint, theme.info);
                    break;

                default:
                    //offline
                    this.SVGHint.text = getLang("rid_offline");
                    this.toColor(this.SVGHint, theme.secondary);
                    break;
            }

            if (this.SVGHint != 0) {
                this.SVGHint.x = this.centreX - this.SVGHint.width / 2;
                this.SVGHint.y = this.height - this.SVGHint.height / 2;
            }
        };

        BaseWidget.prototype.drawWidget = function drawWidget() {
            if (this._event == EVENT_DELETE) {
                return;
            }
            if (this.SVGBackpanel == undefined) return;
            this.SVGBackpanel.color = this._properties.bordercolor.value;
            this.SVGBackpanel.fill = this._properties.backgroundcolor.value;
            this.SVGBackpanel.opacity = this._properties.backgroundopacity.value;

            this.SVGBoxBackpanel.opacity = this._properties.headeropacity.value;
            this.SVGBoxBackpanel.fill = this._properties.headercolor.value;


            var oneHangPercent = 360 + 90 + 30 - 240;
            var drawPercent = this._data * (oneHangPercent / 100); //backdown panel

            /*
            switch (this._networkStatus) {
                case NET_ONLINE: this.SVGBackdownpanel.color = theme.success; break;
                case NET_ERROR: this.SVGBackdownpanel.color = theme.danger; break;
                case NET_RECONNECT: this.SVGBackdownpanel.color = theme.info; break;
                default: //offline
                    this.SVGBackdownpanel.color = theme.light; break;
            }
            */

            switch (this._networkStatus) {
                case NET_ONLINE:
                    //this.toColor(this.SVGBackdownpanel, theme.success);
                    this.SVGBackdownpanel.fill = theme.success;
                    break;

                case NET_ERROR:
                    //this.toColor(this.SVGBackdownpanel, theme.danger);
                    this.SVGBackdownpanel.fill = theme.danger;
                    break;

                case NET_RECONNECT:
                    //this.toColor(this.SVGBackdownpanel, theme.info);
                    this.SVGBackdownpanel.fill = theme.info;
                    break;

                default:
                    //offline
                    //this.toColor(this.SVGBackdownpanel, theme.light);
                    this.SVGBackdownpanel.fill = theme.light;
                    break;
            } //equalizer --------------------------


            if (this._properties.showequalizer.value === 'true') {
                for (var x = 0; x < this.eCount; x++) {
                    var equalizerY = this.equalizerX[x];

                    for (var y = 0; y < 5; y++) {
                        if (this._networkStatus == NET_ONLINE && (this._properties.showequalizer.value === 'true')) {
                            equalizerY[y].opacity = (y + 1) * 0.08;
                        } else {
                            equalizerY[y].opacity = 0.0;
                        }

                        equalizerY[y].fill = theme.secondary;
                    }
                }

                if (this._networkStatus == NET_ONLINE && (this._properties.showequalizer.value === 'true')) {
                    if (this.historyData != undefined) {
                        //reset 
                        var splitHistory = this.historyData.split(";");
                        var count = splitHistory[0];
                        var prop = count / this.eCount;
                        var bigValue;

                        for (var x = 0; x < count; x++) {
                            var equalizerY = this.equalizerX[parseInt(x / prop)];
                            var value = splitHistory[x + 1];

                            if (bigValue == undefined || value > bigValue) {
                                bigValue = value;
                            }
                        }

                        var propValue = parseFloat(bigValue / 5);

                        for (var x = 0; x < count; x++) {
                            if (count < this.eCount) {
                                var equalizerY = this.equalizerX[x];
                            } else {
                                var equalizerY = this.equalizerX[parseInt(x / prop)];
                            }

                            var value = parseInt(splitHistory[x + 1] / propValue);

                            for (var y = 0; y < value; y++) {
                                equalizerY[4 - y].opacity = (1.0 - parseFloat(y / 4.0)) / 2.0;
                                equalizerY[4 - y].fill = theme.success;
                            }
                        }
                    }
                }
            }
            else { //no equalizer
                for (var x = 0; x < this.eCount; x++) {
                    var equalizerY = this.equalizerX[x];
                    for (var y = 0; y < 5; y++) {
                        equalizerY[y].opacity = 0.0;

                    }
                }

            }


            if (this._networkStatus == NET_RECONNECT) {
                this.spinnerAngle += 1.5;

                if (this.SVGArcSpinner.opacity < 0.8) {
                    this.SVGArcSpinner.opacity += 0.01;
                }

                this.SVGArcSpinner.draw(this.spinnerAngle, 240 + this.spinnerAngle);
                var _this = this;
                requestAnimationFrame(function () {
                    return _this.drawWidget();
                });
            } else {
                this.SVGArcSpinner.opacity = 0.0;
                this.SVGArcSpinner.hide();
            }
        };



        BaseWidget.prototype.resize = function resize(size) {

            this.size = size;

            if (this.SVGWidgetText == undefined) return;

            this.svgElement.setAttributeNS(null, "width", size);
            this.svgElement.setAttributeNS(null, "height", size);

            //this.drawText();

        }

        BaseWidget.prototype.onPanelResize = function onPanelResize() {
            var body = document.getElementsByTagName("BODY")[0];
            for (var widgetKey in body.widget) {
                var widget = body.widget[widgetKey];
                widget.resize(widget.widgetHolder.clientWidth);
                // widget.svgElement.setAttributeNS(null, "width", widget.widgetHolder.clientWidth);
                //  widget.svgElement.setAttributeNS(null, "height", widget.widgetHolder.clientWidth);

            }
        }





        BaseWidget.prototype.addEventListner = function addEventListner(_event, _sender) {
            try {
                _event(_sender, this);
            } catch (exception) {
                console.error(exception);
                return; // don't add bad listner
            }

            this.eventListners.push(event = {
                event: _event,
                sender: _sender
            });
        };

        BaseWidget.prototype.clickableToTop = function clickableToTop() {
            this.svgElement.insertBefore(this.SVGWidgetText.SVGText, this.svgElement.childNodes.lastChild);
            this.svgElement.insertBefore(this.SVGLeftIcon.SVGIcon, this.svgElement.childNodes.lastChild);
            this.svgElement.insertBefore(this.SVGRightIcon.SVGIcon, this.svgElement.childNodes.lastChild); // this.svgElement.insertBefore(this.SVGPlusIcon.SVGIcon, this.svgElement.childNodes.lastChild);
            this.svgElement.insertBefore(this.SVGDeleteIcon.SVGIcon, this.svgElement.childNodes.lastChild);
            this.svgElement.insertBefore(this.SVGPropertiesIcon.SVGIcon, this.svgElement.childNodes.lastChild);
        };

        BaseWidget.prototype.showProperties = function showProperties(_event, _sender) {


            _sender.storedProperties = {};

            _sender.inParentIndex = Array.prototype.slice.call(_sender.parentPanel.childNodes).indexOf(_sender.widgetHolder);
            _sender.inParentClass = _sender.widgetHolder.className;
            _sender.parentPanel.removeChild(_sender.widgetHolder);
            _sender.widgetHolder.className = "col-sm-4";
            _sender.mode = WORK_MODE;
            
             makeModalDialog("resetPanel", "showProperties", getLang("showproperties"), "");                
             var modalBody = document.getElementById("showPropertiesModalBody");
             var modalFooter = document.getElementById("showPropertiesModalFooter");

            var widgetDiv = modalBody.appendChild(document.createElement("div"));
            widgetDiv.className = "devicesWidgetsPanel d-flex justify-content-center";
            widgetDiv.appendChild(_sender.widgetHolder);

            var propUl = modalBody.appendChild(document.createElement("ul"));
            propUl.className = "nav nav-tabs";

            var tabContent = modalBody.appendChild(document.createElement("div"));
            tabContent.className = "tab-content";

            var isFirstTab = true;
            for (var key in _sender.properties) {

                _sender.storedProperties[key] = {
                    tab: _sender.properties[key].tab,
                    value: _sender.properties[key].value,
                    type: _sender.properties[key].type
                }

                var tabName = _sender.properties[key].tab;
                if (tabName === 'G') { tabName = "General"; }
                else 
                    if (tabName === 'C') { tabName = "Color"; }
                    else
                        if (tabName === 'O') { tabName = "Opacity"; }


                var tabPane = document.getElementById(tabName + "PropTab");
                var formGroup = document.getElementById(tabName + "PropForm");
                if (formGroup == null) {
                    var propLi = propUl.appendChild(document.createElement("li"));
                    propLi.className = "nav-item";
                    var aHref = propLi.appendChild(document.createElement("a"));
                    aHref.setAttribute("data-toggle", "tab");
                    aHref.href = "#" + tabName + "PropTab";
                    aHref.innerText = tabName;

                    tabPane = tabContent.appendChild(document.createElement("div"));                    
                    tabPane.id = tabName + "PropTab";
                    formGroup = tabPane.appendChild(document.createElement("div"));
                    formGroup.className = "form-group";
                    formGroup.id = tabName + "PropForm";

                    if (isFirstTab) {
                        aHref.className = "nav-link active";
                        tabPane.className = "tab-pane fade show active";
                        isFirstTab = false;
                    }
                    else {
                        aHref.className = "nav-link";
                        tabPane.className = "tab-pane fade";
                    }
                }

                var inputGroup = formGroup.appendChild(document.createElement("div"));
                inputGroup.className = "input-group input-group-sm mb-3";

                var prependDiv = inputGroup.appendChild(document.createElement("div"));
                prependDiv.className = "input-group-prepend";


                var label = prependDiv.appendChild(document.createElement("label"));
                label.className = "input-group-text";
                label.setAttribute("for", "hostEdit");
                label.innerText = key;
                var propEdit = createValueEdit(inputGroup, _sender.properties[key].name, _sender.properties[key].value, _sender.properties[key].type);
                propEdit.className = "form-control form-control-sm";
                propEdit.placeholder = "type value here";
                propEdit.id = "widgetproperty" + key;                

                //propEdit.value = _sender.properties[key].value;
                propEdit.widgetProperty = _sender.properties[key];
                propEdit.widget = _sender;
                propEdit.originalOnChange = propEdit.onchange;
                propEdit.onchange = _sender.onPropertyChange;
                propEdit.onkeyup = _sender.onPropertyChange;


            }

            var setPropError = formGroup.appendChild(document.createElement("label"));
            setPropError.className = "text-danger";

            var closeHeaderButton = document.getElementById("showPropertiescloseHeaderButton");
            closeHeaderButton.widget = _sender;
            closeHeaderButton.onclick = _sender.discardProperties;

            var closeButton = document.getElementById("showPropertiescloseButton");
            closeButton.widget = _sender;
            closeButton.onclick = _sender.discardProperties;

            var setAllWidgetsPropButton = modalFooter.appendChild(document.createElement("button"));
            setAllWidgetsPropButton.type = "button";
            setAllWidgetsPropButton.className = "btn btn-sm btn-warning";
            setAllWidgetsPropButton.id = "allwidgetsModalButton";
            setAllWidgetsPropButton.widget = _sender;
            setAllWidgetsPropButton.onclick = _sender.setAllWidgetsProperties;
            setAllWidgetsPropButton.innerText = getLang("setallwidgetspropbutton");
            setAllWidgetsPropButton.propEdit = propEdit;
            setAllWidgetsPropButton.setPropError = setPropError;

            var setPropButton = modalFooter.appendChild(document.createElement("button"));
            setPropButton.type = "button";
            setPropButton.className = "btn btn-sm btn-success";
            setPropButton.id = "addnodeModalButton";
            setPropButton.widget = _sender;
            setPropButton.onclick = _sender.setProperties;
            setPropButton.innerText = getLang("setpropbutton");
            setPropButton.propEdit = propEdit;
            setPropButton.setPropError = setPropError;

            $('#showPropertiesModal').on('hidden.bs.modal', function (event) {
                if (document.getElementById("showPropertiesModal").setProp != undefined) {
                    return;
                }
                var event = {
                    currentTarget: closeHeaderButton
                }
                _sender.discardProperties(event);
            })


            $("#showPropertiesModal").modal('show');

        };


        BaseWidget.prototype.setProperties = function setProperties(event) {
            event.stopPropagation();
            var button = event.currentTarget;
            var widget = button.widget;

            widget.parentPanel.insertBefore(widget.widgetHolder, widget.parentPanel.childNodes[widget.inParentIndex]);
            widget.widgetHolder.className = widget.inParentClass;
            widget.mode = MOVE_MODE;

            for (var key in widget.properties) {
                var propEdit = document.getElementById("widgetproperty" + key);
                widget.properties[key].value = propEdit.value;
            }

            widget.properties = widget.properties;

            config.save();
            
            document.getElementById("showPropertiesModal").setProp = true;
            $("#showPropertiesModal").modal('hide');
            return false;
        };

        BaseWidget.prototype.setAllWidgetsProperties = function setProperties(event) {
            event.stopPropagation();
            var button = event.currentTarget;
            var widget = button.widget;

            widget.parentPanel.insertBefore(widget.widgetHolder, widget.parentPanel.childNodes[widget.inParentIndex]);
            widget.widgetHolder.className = widget.inParentClass;
            widget.mode = MOVE_MODE;


            for (var i = 0; i < configProperties.dashboards[0].widgets.length; i++) {
                
                var widgetProp = configProperties.dashboards[0].widgets[i];
                var widgetHolder = document.getElementById(widgetProp.deviceId + "BaseWidget");
                if (widgetHolder == null) continue;
                var someWidget = widgetHolder.widget;

                for (var key in someWidget.properties) {
                    if (key === 'headertext') continue;
                    var propEdit = document.getElementById("widgetproperty" + key);
                    if (propEdit != null) {
                        someWidget.properties[key].value = propEdit.value;
                    }
                }
                someWidget.properties = someWidget.properties;
            }

            config.save();

            document.getElementById("showPropertiesModal").setProp = true;
            $("#showPropertiesModal").modal('hide');
            return false;
        };


        BaseWidget.prototype.discardProperties = function discardtProperties(event) {
            var button = event.currentTarget;
            var widget = button.widget;

            widget.parentPanel.insertBefore(widget.widgetHolder, widget.parentPanel.childNodes[widget.inParentIndex]);
            widget.widgetHolder.className = widget.inParentClass;
            widget.mode = MOVE_MODE;
            widget.properties = widget.storedProperties;

            
            //$("#showPropertiesModal").modal('hide');
            return false;
        };


        BaseWidget.prototype.onPropertyChange = function onPropertyChange(event) {

            var propEdit = event.currentTarget;
            var widget = propEdit.widget;

            for (var key in widget.properties) {
                var _propEdit = document.getElementById("widgetproperty" + key);
                widget.properties[key].value = _propEdit.value;
            }

            widget.properties = widget.properties;

            if (propEdit.originalOnChange != undefined) {
                propEdit.originalOnChange(event);
            }

            return true;

        };



        BaseWidget.prototype.moveLeft = function moveLeft(event) {
            var widget = event.currentTarget.widget;

            if (widget.mode == MOVE_MODE) {
                var index = Array.prototype.slice.call(widget.parentPanel.childNodes).indexOf(widget.widgetHolder);
                widget.parentPanel.removeChild(widget.widgetHolder);
                widget.parentPanel.insertBefore(widget.widgetHolder, widget.parentPanel.childNodes[index - 1]);
            }

            return true;
        };

        BaseWidget.prototype.moveRight = function moveRight(event) {
            var widget = event.currentTarget.widget;

            if (widget.mode == MOVE_MODE) {
                var index = Array.prototype.slice.call(widget.parentPanel.childNodes).indexOf(widget.widgetHolder);
                widget.parentPanel.removeChild(widget.widgetHolder);
                widget.parentPanel.insertBefore(widget.widgetHolder, widget.parentPanel.childNodes[index + 1]);
            }

            return true;
        };

        BaseWidget.prototype.propertiesClick = function movepropertiesClick(event) {
            event.stopPropagation();
            var widget = event.currentTarget.widget;

            if (widget.mode == MOVE_MODE) {
                widget.showProperties(event, widget);
            }

            return true;
        };


        BaseWidget.prototype.plusSize = function plusSize(event) {
            var widget = event.currentTarget.widget;

            if (widget.mode == MOVE_MODE) {
                widget.svgElement.setAttributeNS(null, "width", widget.width += 25);
                widget.svgElement.setAttributeNS(null, "height", widget.height += 25);
            }

            return true;
        } //TEMP: NOW IS USED AS DELETE BUTTON !
            ;

        BaseWidget.prototype.deleteWidgetClick = function deleteWidgetClick(event) {
            var widget = event.currentTarget.widget;
            if (widget.mode == MOVE_MODE) {
                widget._event = EVENT_DELETE;
                Array.prototype.slice.call(widget.parentPanel.childNodes).indexOf(widget.widgetHolder);
                widget.parentPanel.removeChild(widget.widgetHolder);
                widget.widgetHolder.innerHTML = "";
            }
            return true;
        };

        BaseWidget.prototype.modeChangeClick = function modeChangeClick(event) {
            var widget = event.currentTarget.widget;

            if (widget.mode == WORK_MODE) {
                widget.mode = MOVE_MODE;
            } else {
                widget.mode = WORK_MODE;
            }

            return true;
        };

        BaseWidget.prototype.mouseOver = function mouseOver(event) {
            var widget = event.currentTarget.widget;
            widget.mouseEnter = true;
            widget.drawMouseEnter();
            return true;
        };

        BaseWidget.prototype.mouseOut = function mouseOut(event) {
            var widget = event.currentTarget.widget;
            widget.mouseEnter = false;
            widget.drawMouseEnter();
            return true;
        };

        BaseWidget.prototype.refresh = function refresh(data, widgetText, label, historyData) {
            if (this._event == EVENT_DELETE) {
                return;
            }

            if (this._data == data && this.widgetText == widgetText && this._properties.headertext == label) return;

            if (this._properties.headertext.value === '---') {
                this._properties.headertext.value = label;
            }


            if (this.widgetText != widgetText) {
                speak(this._properties.headertext + " " + widgetText);
            }


            this.historyData = historyData;
            this._data = data;
            this.widgetText = widgetText;

            this.spinnerAngle = 0;
            this.redrawAll();
        };

        //---------------------------------------------------------------------------------------
        BaseWidget.prototype.redrawAll = function redrawAll() {

            if (this._event == EVENT_DELETE) {
                return;
            }
            var _this = this;
            this.starttime = 0;
            requestAnimationFrame(function () {
                return _this.drawWidget();
            });
            this.drawText();
        };


        BaseWidget.prototype.toColor = function toColor(element, color, method) {
            if (this._event == EVENT_DELETE) {
                return;
            }

            if (method == undefined) method = true;
            if (element == null) return;

            if (element.animantion == null) {
                element.animantion = false;
            }

            if (element.animantion) {
                element.animantion = false;
                window.cancelAnimationFrame(element.animantionFrame);
                this.animateColor(element, color, method);
            }

            element.animantion = true;
            this.animateColor(element, color, method);
        };

        BaseWidget.prototype.animateColor = function animateColor(element, color, method) {
            var _this2 = this;

            if (!element.animantion) return;
            var rgbSrc = element.colorRGB;
            var rgbDst = colorToRGB(color);

            if (rgbSrc[0] == rgbDst[0] && rgbSrc[1] == rgbDst[1] && rgbSrc[2] == rgbDst[2]) {
                window.cancelAnimationFrame(element.animantionFrame);
                element.animantion = false;
                return;
            }

            if (rgbSrc[0] != rgbDst[0]) if (rgbSrc[0] < rgbDst[0]) rgbSrc[0]++; else rgbSrc[0]--;
            if (rgbSrc[1] != rgbDst[1]) if (rgbSrc[1] < rgbDst[1]) rgbSrc[1]++; else rgbSrc[1]--;
            if (rgbSrc[2] != rgbDst[2]) if (rgbSrc[2] < rgbDst[2]) rgbSrc[2]++; else rgbSrc[2]--;
            element.colorRGB = rgbSrc;

            if (!method) {
                element.fillRGB = rgbSrc;
            }

            if (element.animantion) {
                element.animantionFrame = window.requestAnimationFrame(function () {
                    return _this2.animateColor(element, color, method);
                });
            }
        };


        BaseWidget.prototype.drawMouseEnter = function drawMouseEnter() {
            if (this._mode != WORK_MODE) return;
            var _this = this;

            if (this.mouseEnter) {
                if (this.SVGBackpanel.opacity > this._properties.backgroundselectopacity.value) {
                    this.SVGBackpanel.opacity -= 0.05;
                    requestAnimationFrame(function () {
                        return _this.drawMouseEnter();
                    });
                }
            } else {
                if (this.SVGBackpanel.opacity < this._properties.backgroundopacity.value) {
                    this.SVGBackpanel.opacity += 0.005;
                    requestAnimationFrame(function () {
                        return _this.drawMouseEnter();
                    });
                }
            }
        };

        _createClass(BaseWidget, [{
            key: "event",
            set: function set(event) {
                this._event = event;

                for (var k = 0; k < this.eventListners.length; k++) {
                    this.eventListners[k].event(this.eventListners[k].sender, this);
                }
            },
            get: function get() {
                return this._event;
            }
        }, {
            key: "mode",
            set: function set(mode) {
                this._mode = mode;

                if (mode == WORK_MODE) {
                    this.SVGBackpanel.opacity = this._properties.backgroundopacity.value;
                    this.SVGLeftIcon.hide();
                    this.SVGRightIcon.hide(); //  this.SVGPlusIcon.hide();

                    this.SVGDeleteIcon.hide();
                    this.SVGPropertiesIcon.hide();

                } else if (mode == MOVE_MODE) {
                    this.SVGBackpanel.opacity = this._properties.backgroundopacity.value / 3;
                    this.SVGLeftIcon.draw();
                    this.SVGRightIcon.draw(); //   this.SVGPlusIcon.draw();

                    this.SVGDeleteIcon.draw();
                    this.SVGPropertiesIcon.draw();
                }
            },
            get: function get() {
                return this._mode;
            }
        }, {
            key: "networkStatus",
            get: function get() {
                return this._networkStatus;
            },
            set: function set(networkStatus) {
                if (networkStatus >= NET_OFFLINE && networkStatus <= NET_RECONNECT) {
                    this._networkStatus = networkStatus;
                    this.redrawAll();
                }
            }
        },

        {
            key: "properties",
            get: function get() {
                return this._properties;
            },
            set: function set(properties) {
                if (properties == undefined) return;
                this._properties = properties;
                this.drawText();
                this.drawWidget();
            }
        },
        {
            key: "data",
            get: function get() {
                return this._data;
            },
            set: function set(data) {
                this._data = data;
                this.redrawAll();
            }
        },
        {
            key: "onload",
            get: function get() {
                return this._onload;
            },
            set: function set(onload) {
                this._onload = onload;
            }
        }

        ]);

        return BaseWidget;
    }();