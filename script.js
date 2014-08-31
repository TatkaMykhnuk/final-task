/**
 * Created by Tatka on 26.08.14.
 */
var slideViewModelBase = function(visible, name, templateName){
    this.visible = ko.observable(visible);
    this.name = ko.observable(name);
    this.templateName = ko.observable(templateName);
}

var CalculatorViewModel = function(percentValue, injectionsAvoidedPercentValue, numberOfHospitalSavedBeds, proportionOfPatientsHospitalised){
    var self = this;
    self.numberPatients = ko.observable(null);
    self.totalNumberPatients = ko.computed(function() {
        return self.numberPatients() * percentValue;
    });

    self.injectionsAvoidedValue = ko.computed(function() {
        var b = 182 * (injectionsAvoidedPercentValue * self.totalNumberPatients());
        var c = 2 * 8 * (self.totalNumberPatients() - (injectionsAvoidedPercentValue * self.totalNumberPatients()));
        return b + c;
    });

    self.inrVisitsAvoidedValue = ko.computed(function() {
        var w = self.totalNumberPatients() - (self.totalNumberPatients() * injectionsAvoidedPercentValue);
        var d = 9 + 5;
        return w * d;
    });
    self.nurseVisitsAvoidedValue = ko.computed(function() {
        var c = 2 * 8 * (self.totalNumberPatients() - (injectionsAvoidedPercentValue * self.totalNumberPatients()));
        return 0.064 * c;
    });

    self.hospitalBedDaysSavedValue = ko.computed(function() {
        return numberOfHospitalSavedBeds * (self.totalNumberPatients() * proportionOfPatientsHospitalised);

    });
}

var calculatorSlideViewModel = function(){
    var self = this;
    self.calculators = ko.observableArray();

    //add DVT calculator
    self.calculators.push(new CalculatorViewModel(0.925, 0.122, 3, 0.52));

    //add PE calculator
    self.calculators.push(new CalculatorViewModel(0.85, 0.176, 1, 0.9));

    self.injectionsAvoidedTotalValue = ko.computed(function() {
        var result = 0;
        for(var i=0; i < self.calculators().length; i++){
            result+= self.calculators()[i].injectionsAvoidedValue();
        }
        return result;
    });

    self.inrVisitsAvoidedTotalValue = ko.computed(function() {
        var result = 0;
        for(var i=0; i < self.calculators().length; i++){
            result+= self.calculators()[i].inrVisitsAvoidedValue();
        }
        return result;
    });

    self.nurseVisitsAvoidedTotalValue = ko.computed(function() {
        var result = 0;
        for(var i=0; i < self.calculators().length; i++){
            result+= self.calculators()[i].nurseVisitsAvoidedValue();
        }
        return result;
    });

    self.hospitalBedDaysSavedTotalValue = ko.computed(function() {
        var result = 0;
        for(var i=0; i < self.calculators().length; i++){
            result+= self.calculators()[i].hospitalBedDaysSavedValue();
        }
        return result;
    });
};

calculatorSlideViewModel.prototype = new slideViewModelBase(false, "Calculator", "CalculatorSlideTemplate");

var slidesNames = ['Graphics','Calculator', 'Balance'];

var viewModel = function() {
    var self = this;
    self.templateName = function(slide){
        return slide.templateName();
    }

    self.slides = ko.observableArray();
    //Fill slides view models
    for (var i = 0; i < slidesNames.length; i++){
        var templateName = slidesNames[i] + "SlideTemplate";
        var newSlideViewModel = new slideViewModelBase(false, slidesNames[i], templateName);
        if(slidesNames[i] == 'Calculator'){
            newSlideViewModel = new calculatorSlideViewModel();
            newSlideViewModel.visible(true);
        }
        self.slides.push(newSlideViewModel);
    }

    self.activateSlideCommand = function(){
        this.visible(true);
        for (var i = 0; i < self.slides().length; ++i){
            if(self.slides()[i] != this){
                self.slides()[i].visible(false);
            }
        }
    }

    self.switchSlides = function (direction){
        for (var i = 0; i < this.slides().length; i++){
            var current = this.slides()[i];
            if(current.visible() == true){
                current.visible(false);

                var newIndex = 0;
                //true to right
                if(direction === true){
                    newIndex = i + 1;
                    if(this.slides().length == newIndex){
                        newIndex = 0;
                    }
                }
                //false to left
                else{
                    if(i == 0){
                        newIndex = this.slides().length - 1;
                    }
                    else{
                        newIndex = i-1;
                    }
                }

                this.slides()[newIndex].visible(true);
                break;
            }
        }
    }
};

var newMainViewModel = new viewModel();
ko.applyBindings(newMainViewModel);

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

function handleTouchEnd(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }
    var xUp = evt.changedTouches[0].pageX;
    var yUp = evt.changedTouches[0].pageY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/

        if ( xDiff > 0) {
            if(xDiff<150) return;
            /* left swipe */
            newMainViewModel.switchSlides(true);
        } else {
            if(xDiff>-150) return;
            /* right swipe */
            newMainViewModel.switchSlides(false);
        }
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */
        } else {
            /* down swipe */
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};