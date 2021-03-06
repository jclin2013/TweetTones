import json2csv from 'json2csv';
import merge from 'lodash/merge';
import { fields, fieldNames } from './fieldsAndFieldNamesForCSV';
import { BarChartsProcessor } from './barcharts_processor';
import { ScatterplotProcessor } from './scatterplot_processor';

class SentimentsProcessor {
  constructor(tweetsHash) {
    this.tweetsHash = tweetsHash;
    this.barchartsProcessor = new BarChartsProcessor;
    this.scatterplot_processor = new ScatterplotProcessor;
    this.emotionLineChart = null;
    this.singleColPageBreakpoint = 915;
  }

  updateBarcharts(currentTweet) {
    this.barchartsProcessor.updateAllBarCharts(currentTweet);
  }

  updateScatterplot(data) {
    this.scatterplot_processor.updateScatterplot(data);
    $('.spinner').remove();

    if ($(window).width() <= this.singleColPageBreakpoint) {
        $('.scatterplot-container').append(
          `<div class='tooSmallNotification'>Enlarge window to see scatterplot</div>`
        );
      }
  }

  createBarCharts(id) {
    ["emotion_tone", "language_tone", "social_tone"].forEach(title => {
      let toneCategory = this.tweetsHash[id][title];
      let labels = Object.keys(toneCategory);
      let data = Object.values(toneCategory);
      this.barchartsProcessor.createBarChart(data, labels, title);
    })
  }

  createScatterplot(data) {
    this.scatterplot_processor.createScatterplot(data);
  }

  introTooltips() {
    $('.top-dashboard').popupTooltip('top-left', `
        Scroll through the tweets and click on one
        to see its tone analyses in the bar charts.
    `);

    setTimeout( () => $('.barcharts-container').popupTooltip('top', `
        A note on IBM Watson's scoring: Less than 0.5 means 'unlikely present.'
        More than 0.5 means 'likely present,' and more than 0.75
        means 'very likely present.'
    `), 3000);

    setTimeout( () => $('.top-dashboard').popupTooltip('bottom-left', `
        Scroll to the bottom of this column and click on 'Load
        more Tweets' to feed more data into the scatterplot below.
    `), 7000);

    if ($(window).width() > this.singleColPageBreakpoint) {
      setTimeout( () => $('.scatterplot-container').popupTooltip('top-right', `
          When the scatterplot is loaded, hover over a data point to
          see its associated tweet, date & time, and tone score.
          Double click to zoom in on the timeline. Shift + double click
          to zoom back out. Click on legend items to hide or show specific
          tone categories.
      `), 10000);
    }
  }

  removeScatterplotIfWindowTooSmall() {
    $(window).resize(() => {
      $('#twitter-timeline-container').height(
        $('.emotion_tone_barchart').height() * 3 + 40
      );

      $('.popupTooltip.side-top-right').remove();

      let windowWidth = $(window).width(),
          noteAlreadyPresent = document.querySelector('.tooSmallNotification'),
          spinnerPresent = document.querySelector('.spinner');

      if (windowWidth <= this.singleColPageBreakpoint && !spinnerPresent && !noteAlreadyPresent) {
          $('.scatterplot-container').append(
            `<div class='tooSmallNotification'>Enlarge window to see scatterplot</div>`
          );
        }

      if (windowWidth > this.singleColPageBreakpoint) $('.tooSmallNotification').remove();
    });
  }

  toggleMenuDropDown() {
    $('.fa-bars').toggleClass('selected');
    $('.menuDropdownMenu, .arrow-up').toggle(200);
  }

  setupButtonListeners() {
    $('.fa-bars').click(() => this.toggleMenuDropDown());

    $('#lookUpAnotherTwitterUserButton').click(() => window.location.reload());

    $('.appOptionsLinks > *, .aboutThisAppLinks > *').each((idx, el) =>
      el.onclick = () => this.toggleMenuDropDown()
    );

    $('#takeATourButton').click(() => this.introTooltips());

    $('.navbarLogoAndText').click(() => window.location.reload());

    $('body').click(e => {
        if ($(e.target).closest('.navbarHamburgerContainer').length === 0 && document.querySelector('.selected')) {
          this.toggleMenuDropDown();
        }
    });

    $('#downloadCSVButton').click(this.deployCSVFile.bind(this));
    $('#downloadJSONButton').click(this.deployJSONFile.bind(this));
  }

  deployCSVFile() {
    let data = Object.values(merge({}, this.tweetsHash));

    data.forEach((obj, i) => {
        data[i].timestamp = new Date(data[i].timestamp)
                            .toLocaleString()
                            .replace(',', '');
    });

    let options = { data, fields, fieldNames },
        csv = "data:text/csv;charset=utf-8," + json2csv(options),
        encodedFile = encodeURI(csv),
        link = document.createElement("a");

    link.setAttribute("href", encodedFile);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
  }

  deployJSONFile() {
    let dataType = "data:application/json;charset=utf-8,",
        dataStr = dataType + encodeURIComponent(JSON.stringify(this.tweetsHash)),
        link = document.createElement("a");

    link.setAttribute("href", dataStr);
    link.setAttribute("download", "data.json");
    document.body.appendChild(link);
    link.click();
  }

  finalizeDeployment() {
    this.setupButtonListeners();

    $('#twitter-timeline-container').height(
      $('.emotion_tone_barchart').height() * 3 + 40
    );

    this.removeScatterplotIfWindowTooSmall();

    this.introTooltips();

    window.onbeforeunload = function(event) {
      window.scrollTo(0, 0);
      return null;
    };
  }
}

export default SentimentsProcessor;
