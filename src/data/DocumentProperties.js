import SectionElement from '../elements/SectionElement';
import * as utils from '../utils';

/**
 * Data object containing all document properties like page size, margins, etc.
 * @class
 */
export default class DocumentProperties {
    constructor(rb) {
        this.rb = rb;
        this.id = '0_document_properties';
        this.name = '';
        this.boCode = '';
        this.panelItem = null;
        this.errors = [];

        this.pageFormat = DocumentProperties.pageFormat.A4;
        this.pageWidth = '';
        this.pageHeight = '';
        this.unit = DocumentProperties.unit.px;
        this.orientation = DocumentProperties.orientation.portrait;
        this.contentHeight = '';
        this.marginLeft = '';
        this.marginLeftVal = 0;
        this.marginTop = '';
        this.marginTopVal = 0;
        this.marginRight = '';
        this.marginRightVal = 0;
        this.marginBottom = '';
        this.marginBottomVal = 0;

        this.header = false;
        this.headerSize = '80';
        this.headerDisplay = DocumentProperties.display.always;
        this.footer = false;
        this.footerSize = '80';
        this.footerDisplay = DocumentProperties.display.always;

        this.pageHeaderSize = '80';
        this.startSectionSize = '300';
        this.repetitionSize = '60';
        this.endSectionSize = '80';
        this.pageFooterSize = '80';

        this.headerSizeVal = this.header ? utils.convertInputToNumber(this.headerSize) : 0;
        this.footerSizeVal = this.footer ? utils.convertInputToNumber(this.footerSize) : 0;

        this.patternLocale = rb.getProperty('patternLocale');
        this.patternCurrencySymbol = rb.getProperty('patternCurrencySymbol');

        // width and height in pixel
        this.width = 0;
        this.height = 0;
    }

    setInitialData(initialData) {
        for (let key in initialData) {
            if (initialData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = initialData[key];
            }
        }
        this.headerSizeVal = this.header ? utils.convertInputToNumber(this.headerSize) : 0;
        this.footerSizeVal = this.footer ? utils.convertInputToNumber(this.footerSize) : 0;
        this.marginLeftVal = utils.convertInputToNumber(this.marginLeft);
        this.marginTopVal = utils.convertInputToNumber(this.marginTop);
        this.marginRightVal = utils.convertInputToNumber(this.marginRight);
        this.marginBottomVal = utils.convertInputToNumber(this.marginBottom);
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
        let size = this.getPageSize();
        this.updatePageSize(size);
        this.rb.getDocument().updatePageMargins();
        this.rb.getDocument().updateHeader();
        this.rb.getDocument().updateFooter();
        this.updateHeader();
        this.updateFooter();
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['pageFormat', 'pageWidth', 'pageHeight', 'unit', 'orientation',
            'contentHeight', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom',
            'header', 'headerSize', 'headerDisplay', 'footer', 'footerSize', 'footerDisplay',
            'patternLocale', 'patternCurrencySymbol',
            'name', 'boCode',
            'pageHeaderSize', 'startSectionSize', 'repetitionSize', 'endSectionSize', 'pageFooterSize'
        ];
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.rb.getLabel('documentProperties');
    }

    getPanelItem() {
        return this.panelItem;
    }

    setPanelItem(panelItem) {
        this.panelItem = panelItem;
    }

    getValue(field) {
        return this[field];
    }

    setValue(field, value, elSelector, isShown) {
        this[field] = value;
        if (field === 'marginLeft' || field === 'marginTop' || field === 'marginRight' || field === 'marginBottom') {
            this[field + 'Val'] = utils.convertInputToNumber(value);
            this.rb.getDocument().updatePageMargins();
            this.rb.getDocument().updateHeader();
            this.rb.getDocument().updateFooter();
        } else if (field === 'header') {
            this.updateHeader();
        } else if (field === 'footer') {
            this.updateFooter();
        }
        if (field === 'pageHeaderSize' || field === 'startSectionSize' || field === 'repetitionSize' ||
            field === 'endSectionSize' || field === 'pageFooterSize') {
            this.rb.getDocument().updatePosition();
        }
        if (field === 'header' || field === 'headerSize') {
            this.rb.getDocument().updateHeader();
            this.headerSizeVal = this.header ? utils.convertInputToNumber(this.headerSize) : 0;
        }
        if (field === 'footer' || field === 'footerSize') {
            this.rb.getDocument().updateFooter();
            this.footerSizeVal = this.footer ? utils.convertInputToNumber(this.footerSize) : 0;
        }
        if (field === 'pageFormat' || field === 'pageWidth' || field === 'pageHeight' || field === 'unit' ||
            field === 'orientation' || field === 'contentHeight' ||
            field === 'marginTop' || field === 'marginBottom') {
            let size = this.getPageSize();
            this.updatePageSize(size);
        }
    }

    updatePageSize(size) {
        this.width = size.width;
        this.height = size.height;
        this.rb.getDocument().updatePageSize(size.width, size.height);

        // update width of all elements which cover full width
        let docElements = this.rb.getDocElements(true);
        for (let docElement of docElements) {
            if (docElement instanceof SectionElement) {
                docElement.setWidth(size.width);
            }
        }
    }

    updateHeader() {
        if (this.header) {
            this.rb.getMainPanel().showHeader();
        } else {
            this.rb.getMainPanel().hideHeader();
        }
    }

    updateFooter() {
        if (this.footer) {
            this.rb.getMainPanel().showFooter();
        } else {
            this.rb.getMainPanel().hideFooter();
        }
    }

    /**
     * Returns page size in pixels at 72 dpi.
     * @returns {Object} width, height
     */
    getPageSize() {
        let pageWidth;
        let pageHeight;
        let unit;
        let dpi = 72;
        // A4纸的尺寸是210mm*297mm，也就是21.0cm*29.7cm，而1英寸=2.54cm，
        // 如果屏幕DPI分辨率为72像素/英寸，
        // 换算一下：相当于1cm可呈现 (72px/2.54cm) = 28.34px
        if (this.pageFormat === DocumentProperties.pageFormat.A4) {
            if (this.orientation === DocumentProperties.orientation.portrait) {
                pageWidth = 210;
                pageHeight = 297;
            } else {
                pageWidth = 297;
                pageHeight = 210;
            }
            unit = DocumentProperties.unit.mm;
        } else if (this.pageFormat === DocumentProperties.pageFormat.A5) {
            if (this.orientation === DocumentProperties.orientation.portrait) {
                pageWidth = 148;
                pageHeight = 210;
            } else {
                pageWidth = 210;
                pageHeight = 148;
            }
            unit = DocumentProperties.unit.mm;
        } else if (this.pageFormat === DocumentProperties.pageFormat.letter) {
            if (this.orientation === DocumentProperties.orientation.portrait) {
                pageWidth = 8.5;
                pageHeight = 11;
            } else {
                pageWidth = 11;
                pageHeight = 8.5;
            }
            unit = DocumentProperties.unit.inch;
        } else {
            pageWidth = utils.convertInputToNumber(this.pageWidth);
            pageHeight = utils.convertInputToNumber(this.pageHeight);
            unit = this.unit;
        }
        if (unit === DocumentProperties.unit.mm) {
            pageWidth = Math.round((dpi * pageWidth) / 25.4);
            pageHeight = Math.round((dpi * pageHeight) / 25.4);
        } else if (unit === DocumentProperties.unit.inch) {
            pageWidth = Math.round(dpi * pageWidth);
            pageHeight = Math.round(dpi * pageHeight);
        }
        if (this.contentHeight.trim() !== '') {
            pageHeight = utils.convertInputToNumber(this.contentHeight) +
                this.marginTopVal + this.marginBottomVal + this.headerSizeVal + this.footerSizeVal;
        }
        return { width: pageWidth, height: pageHeight };
    }

    /**
     * Returns size of content band without any margins.
     * @returns {Object} width, height
     */
    getContentSize() {
        let size = this.getPageSize();
        let height;
        if (this.contentHeight.trim() !== '') {
            height = utils.convertInputToNumber(this.contentHeight);
        } else {
            height = size.height - this.marginTopVal - this.marginBottomVal -
                this.headerSizeVal - this.footerSizeVal;
        }
        return {
            width: size.width - this.marginLeftVal - this.marginRightVal,
            height: height
        };
    }

    addError(error) {
        this.errors.push(error);
    }

    clearErrors() {
        this.errors = [];
    }

    getErrors() {
        return this.errors;
    }

    remove() {}

    select() {}

    deselect() {}

    toJS() {
        let ret = {};
        for (let field of this.getFields()) {
            ret[field] = this.getValue(field);
        }
        return ret;
    }
}

DocumentProperties.outputFormat = {
    pdf: 'pdf',
    xlsx: 'xlsx'
};

DocumentProperties.pageFormat = {
    A4: 'A4',
    A5: 'A5',
    letter: 'letter', // 215.9 x 279.4 mm
    userDefined: 'user_defined'
};

DocumentProperties.unit = {
    mm: 'mm',
    inch: 'inch',
    px: 'px'
};

DocumentProperties.orientation = {
    portrait: 'portrait',
    landscape: 'landscape'
};

DocumentProperties.display = {
    always: 'always',
    notOnFirstPage: 'not_on_first_page'
};