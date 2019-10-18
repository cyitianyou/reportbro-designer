import MainPanelItem from './MainPanelItem';
import Container from '../container/Container';
import Document from '../Document';

/**
 * Main panel which contains all report elements like doc elements, parameters and styles.
 * The main panel shows the structure and all components of the report.
 * @class
 */
export default class MainPanel {
    constructor(rootElement, headerBand, contentBand, footerBand, pageHeaderBand, startSectionBand, repetitionBand,
        endSectionBand, pageFooterBand, parameterContainer, styleContainer, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.headerItem = new MainPanelItem(
            'band', null, headerBand, { hasChildren: true, showAdd: false, showDelete: false, hasDetails: false, visible: this.rb.getDocumentProperties().getValue('header') }, rb);

        this.documentItem = new MainPanelItem(
            'band', null, contentBand, { hasChildren: true, showAdd: false, showDelete: false, hasDetails: false }, rb);

        this.footerItem = new MainPanelItem(
            'band', null, footerBand, { hasChildren: true, showAdd: false, showDelete: false, hasDetails: false, visible: this.rb.getDocumentProperties().getValue('footer') }, rb);

        this.parametersItem = new MainPanelItem(
            'parameter', null, parameterContainer, { hasChildren: true, showAdd: rb.getProperty('adminMode'), showDelete: false, hasDetails: false }, rb);

        this.stylesItem = new MainPanelItem(
            'style', null, styleContainer, { hasChildren: true, showAdd: true, showDelete: false, hasDetails: false }, rb);

        this.documentPropertiesItem = new MainPanelItem(
            'documentProperties', null, rb.getDocumentProperties(), { showDelete: false, hasDetails: true }, rb);
        this.pageHeaderItem = new MainPanelItem(
            'band', null, pageHeaderBand, {
                hasChildren: true,
                showAdd: false,
                showDelete: false,
                hasDetails: false
            }, rb);
        this.startSectionItem = new MainPanelItem(
            'band', null, startSectionBand, {
                hasChildren: true,
                showAdd: false,
                showDelete: false,
                hasDetails: false
            }, rb);
        this.repetitionItem = new MainPanelItem(
            'table', null, repetitionBand, {
                hasChildren: true,
                showAdd: false,
                showDelete: false,
                hasDetails: true
            }, rb);
        this.repetitionItem.setActive = function() {
            $('.rbroMenuItem').removeClass('rbroMenuItemActive');
            $(`#rbro_menu_item${this.id}`).addClass('rbroMenuItemActive');
            if (this.properties.hasDetails) {
                this.rb.setDetailPanel(this.panelName, this.tableData);
            }
        }.bind(this.repetitionItem);
        this.endSectionItem = new MainPanelItem(
            'band', null, endSectionBand, {
                hasChildren: true,
                showAdd: false,
                showDelete: false,
                hasDetails: false
            }, rb);
        this.pageFooterItem = new MainPanelItem(
            'band', null, pageFooterBand, {
                hasChildren: true,
                showAdd: false,
                showDelete: false,
                hasDetails: false
            }, rb);
        this.items = [
            this.documentPropertiesItem,
            this.pageHeaderItem,
            this.startSectionItem,
            this.repetitionItem,
            this.endSectionItem,
            this.pageFooterItem
        ];

        this.dragMainPanelSizer = false;
        this.dragMainPanelSizerStartX = 0;
        this.mainPanelWidth = 230;
        this.mainPanelSizerWidth = 3;

        headerBand.setPanelItem(this.headerItem);
        contentBand.setPanelItem(this.documentItem);
        footerBand.setPanelItem(this.footerItem);
        parameterContainer.setPanelItem(this.parametersItem);
        styleContainer.setPanelItem(this.stylesItem);

        pageHeaderBand.setPanelItem(this.pageHeaderItem);
        startSectionBand.setPanelItem(this.startSectionItem);
        repetitionBand.setPanelItem(this.repetitionItem);
        endSectionBand.setPanelItem(this.endSectionItem);
        pageFooterBand.setPanelItem(this.pageFooterItem);
    }

    getHeaderItem() {
        return this.headerItem;
    }

    getDocumentItem() {
        return this.documentItem;
    }

    getFooterItem() {
        return this.footerItem;
    }

    getParametersItem() {
        return this.parametersItem;
    }

    getStylesItem() {
        return this.stylesItem;
    }

    getContainerByItem(item) {
        while (item !== null) {
            if (item.getData() instanceof Container) {
                return item.getData();
            }
            item = item.getParent();
        }
        return null;
    }

    getDocumentPropertiesItem() {
        return this.documentPropertiesItem;
    }

    render() {
        let panel = $('#rbro_main_panel_list');
        this.appendChildren(panel, this.items);

        $('#rbro_main_panel_sizer').mousedown(event => {
            this.dragMainPanelSizer = true;
            this.dragMainPanelSizerStartX = event.pageX;
        });

        this.updateMainPanelWidth(this.mainPanelWidth);
    }

    appendChildren(el, items) {
        for (let item of items) {
            el.append(item.getElement());
            let children = item.getChildren();
            if (children.length > 0) {
                let elChildren = $(`#${item.getId()}_children`);
                this.appendChildren(el, children);
            }
        }
    }

    processMouseMove(event) {
        if (this.dragMainPanelSizer) {
            let mainPanelWidth = this.mainPanelWidth + (event.pageX - this.dragMainPanelSizerStartX);
            mainPanelWidth = this.checkMainPanelWidth(mainPanelWidth);
            this.updateMainPanelWidth(mainPanelWidth);
            return true;
        }
        return false;
    }

    mouseUp(event) {
        if (this.dragMainPanelSizer) {
            this.dragMainPanelSizer = false;
            this.mainPanelWidth = this.mainPanelWidth + (event.pageX - this.dragMainPanelSizerStartX);
            this.mainPanelWidth = this.checkMainPanelWidth(this.mainPanelWidth);
            this.updateMainPanelWidth(this.mainPanelWidth);
        }
    }

    updateMainPanelWidth(mainPanelWidth) {
        $('#rbro_main_panel').css({ width: mainPanelWidth });
        $('#rbro_main_panel_sizer').css({ left: mainPanelWidth });
        $('#rbro_detail_panel').css({ left: mainPanelWidth + this.mainPanelSizerWidth });
        let docPanelLeft = mainPanelWidth + this.mainPanelSizerWidth + 390;
        $('#rbro_document_panel').css({ width: `calc(100% - ${docPanelLeft}px)` });
    }

    checkMainPanelWidth(mainPanelWidth) {
        if (mainPanelWidth < 150) {
            return 150;
        } else if (mainPanelWidth > 500) {
            return 500;
        }
        return mainPanelWidth;
    }

    showHeader() {
        this.headerItem.show();
    }

    hideHeader() {
        this.headerItem.hide();
    }

    showFooter() {
        this.footerItem.show();
    }

    hideFooter() {
        this.footerItem.hide();
    }

    clearAll() {
        for (let item of this.items) {
            item.clear();
        }
    }
}