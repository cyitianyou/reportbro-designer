import Container from './Container';
import DocElement from '../elements/DocElement';
import Document from '../Document';
import * as utils from '../utils';

/**
 * Standard band container for header, content and footer band.
 * @class
 */
export default class Band extends Container {
    constructor(bandType, section, id, name, rb) {
        super(id, name, rb);
        this.panelItem = null;
        this.bandType = bandType;
        this.section = section;
        if (!section) {
            if (bandType === Band.bandType.header) {
                this.id = '0_header';
                this.name = rb.getLabel('bandHeader');
            } else if (bandType === Band.bandType.content) {
                this.id = '0_content';
                this.name = rb.getLabel('bandContent');
                this.allowAllElements = true;
            } else if (bandType === Band.bandType.footer) {
                this.id = '0_footer';
                this.name = rb.getLabel('bandFooter');
            } else if (bandType === Band.bandType.page_header) {
                this.id = '0_page_header';
                this.name = rb.getLabel('bandPageHeader');
            } else if (bandType === Band.bandType.start_section) {
                this.id = '0_start_section';
                this.name = rb.getLabel('bandStartSection');
            } else if (bandType === Band.bandType.repetition) {
                this.id = '0_repetition';
                this.name = rb.getLabel('bandRepetition');
            } else if (bandType === Band.bandType.end_section) {
                this.id = '0_end_section';
                this.name = rb.getLabel('bandEndSection');
            } else if (bandType === Band.bandType.page_footer) {
                this.id = '0_page_footer';
                this.name = rb.getLabel('bandPageFooter');
            }
        }
        this.el = null;
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
        if (!this.section) {
            this.el = this.rb.getDocument().getElement(this.bandType);
            this.elContent = this.el;
        }
    }

    /**
     * Returns true if the given element type can be added to this container.
     * @param {String} elementType
     */
    isElementAllowed(elementType) {
        if (elementType === DocElement.type.tableText) {
            return false;
        }
        if (this.bandType === Band.bandType.repetition && elementType === DocElement.type.table) {
            return true;
        }
        return (this.bandType === Band.bandType.content ||
                (elementType !== DocElement.type.pageBreak && elementType !== DocElement.type.table && elementType !== DocElement.type.section)) &&
            (!this.section || elementType !== DocElement.type.section);
    }

    /**
     * Returns absolute container offset.
     * @returns {Object} x and y offset coordinates.
     */
    getOffset() {
        let y = 0;
        if (this.section) {
            if (this.owner !== null) {
                let absPos = this.owner.getAbsolutePosition();
                y = absPos.y;
            }
        } else {
            let docProperties = this.rb.getDocumentProperties();
            let pageHeader = utils.convertInputToNumber(docProperties.getValue('pageHeaderSize'));
            let startSection = utils.convertInputToNumber(docProperties.getValue('startSectionSize'));
            let repetition = utils.convertInputToNumber(docProperties.getValue('repetitionSize'));
            if (this.bandType === Band.bandType.content && docProperties.getValue('header')) {
                y = utils.convertInputToNumber(docProperties.getValue('headerSize'));
            } else if (this.bandType === Band.bandType.footer) {
                y = this.rb.getDocument().getHeight() - utils.convertInputToNumber(docProperties.getValue('footerSize'));
            } else if (this.bandType === Band.bandType.page_header) {
                y = 0;
            } else if (this.bandType === Band.bandType.start_section) {
                y = pageHeader;
            } else if (this.bandType === Band.bandType.repetition) {
                y = pageHeader + startSection;
            } else if (this.bandType === Band.bandType.end_section) {
                y = pageHeader + startSection + repetition;
            } else if (this.bandType === Band.bandType.page_footer) {
                y = this.rb.getDocument().getHeight() - utils.convertInputToNumber(docProperties.getValue('footerSize'));
            }
        }
        return { x: 0, y: y };
    }

    /**
     * Returns container size.
     * @returns {Object} width and height of container.
     */
    getSize() {
        let documentProperties = this.rb.getDocumentProperties();
        let width = documentProperties.getValue('width') -
            documentProperties.getValue('marginLeftVal') - documentProperties.getValue('marginRightVal');
        let height = 0;
        if (this.section) {
            if (this.owner !== null) {
                height = this.owner.getValue('heightVal');
            }
        } else if (this.bandType === Band.bandType.header) {
            height = documentProperties.getValue('headerSizeVal');
        } else if (this.bandType === Band.bandType.content) {
            height = documentProperties.getValue('height') - documentProperties.getValue('headerSizeVal') -
                documentProperties.getValue('footerSizeVal') -
                documentProperties.getValue('marginTopVal') - documentProperties.getValue('marginBottomVal');
        } else if (this.bandType === Band.bandType.footer) {
            height = documentProperties.getValue('footerSizeVal');
        } else if (this.bandType === Band.bandType.page_header) {
            height = utils.convertInputToNumber(documentProperties.getValue('pageHeaderSize'));
        } else if (this.bandType === Band.bandType.start_section) {
            height = utils.convertInputToNumber(documentProperties.getValue('startSectionSize'));
        } else if (this.bandType === Band.bandType.repetition) {
            height = utils.convertInputToNumber(documentProperties.getValue('repetitionSize'));
        } else if (this.bandType === Band.bandType.end_section) {
            height = utils.convertInputToNumber(documentProperties.getValue('endSectionSize'));
        } else if (this.bandType === Band.bandType.page_footer) {
            height = utils.convertInputToNumber(documentProperties.getValue('pageFooterSize'));
        }
        return { width: width, height: height };
    }

    /**
     * Returns container content size. Same as container size.
     * @returns {Object} width and height of container.
     */
    getContentSize() {
        return this.getSize();
    }

    isInside(posX, posY) {
        if (this.section && this.owner !== null && this.owner && !this.owner.isVisible()) {
            return false;
        }
        return super.isInside(posX, posY);
    }
}

Band.bandType = {
    header: 'header',
    content: 'content',
    footer: 'footer',
    /** 页眉区 */
    page_header: 'page_header',
    /** 开始区 */
    start_section: 'start_section',
    /** 重复区 */
    repetition: 'repetition',
    /** 结束区 */
    end_section: 'end_section',
    /** 页脚区 */
    page_footer: 'page_footer'
};