import { ComponentType, ReactNode } from 'react';

// Comprehensive block editor types for plugin development

declare module '@wordpress/block-editor' {
    // Block props and block instance
    interface BlockProps {
        className?: string;
        [key: string]: any;
    }
    interface Block {
        name: string;
        clientId?: string;
        attributes: Record<string, any>;
        innerBlocks?: Block[];
        parent?: string;
        isValid?: boolean;
        [key: string]: any;
    }
    interface BlockType {
        name: string;
        title?: string;
        description?: string;
        icon?: any;
        category?: string;
        attributes?: Record<string, any>;
        edit: ComponentType<any>;
        save: ComponentType<any>;
        supports?: Record<string, any>;
        example?: any;
        variations?: any[];
        [key: string]: any;
    }
    interface BlockVariation {
        name: string;
        title: string;
        description?: string;
        icon?: any;
        attributes?: Record<string, any>;
        innerBlocks?: any[];
        isDefault?: boolean;
        scope?: string[];
    }
    // Block context
    interface BlockContext {
        [key: string]: any;
    }
    // Block editor store selectors/actions
    interface BlockEditorStore {
        getBlocks: (clientId?: string) => Block[];
        getBlock: (clientId: string) => Block | undefined;
        getBlockOrder: (clientId: string) => string[];
        getSelectedBlock: () => Block | undefined;
        getSelectedBlockClientId: () => string | undefined;
        getBlockRootClientId: (clientId: string) => string | undefined;
        getBlockParents: (clientId: string) => string[];
        getBlockCount: (clientId?: string) => number;
        [key: string]: any;
    }
    // Block editor components
    interface InnerBlocksProps {
        allowedBlocks?: string[];
        template?: Array<[string, Record<string, any>]>
        templateLock?: boolean | 'all' | 'insert';
        renderAppender?: () => ReactNode;
        orientation?: 'horizontal' | 'vertical';
        // Experimental props
        __experimentalBlocks?: Block[];
        __experimentalBlock?: Block;
    }
    export const InnerBlocks: ComponentType<InnerBlocksProps> & {
        Content: ComponentType;
    };
    export const BlockControls: ComponentType<{ children: ReactNode }>;
    export const InspectorControls: ComponentType<{ children: ReactNode }>;
    export const MediaUpload: ComponentType<{ onSelect: (media: any) => void; allowedTypes?: string[]; value?: number; render: (props: { open: () => void }) => ReactNode }>;
    export const MediaUploadCheck: ComponentType<{ children: ReactNode }>;
    export const BlockAlignmentToolbar: ComponentType<{ children: ReactNode }>;
    export const BlockListBlock: ComponentType<{ block: Block }>;
    export const RichText: ComponentType<any>;
    export const BlockIcon: ComponentType<{ icon: any }>;
    export const BlockVerticalAlignmentToolbar: ComponentType<any>;
    export const BlockEdit: ComponentType<any>;
    export const BlockInspector: ComponentType<any>;
    export const BlockMover: ComponentType<any>;
    export const BlockSelectionClearer: ComponentType<any>;
    export const BlockSettingsMenu: ComponentType<any>;
    export const BlockTitle: ComponentType<any>;
    export const BlockToolbar: ComponentType<any>;
    export const WritingFlow: ComponentType<any>;
    export const ObserveTyping: ComponentType<any>;
    export const PlainText: ComponentType<any>;
    export const URLInput: ComponentType<any>;
    export const BlockAppender: ComponentType<any>;
    export const BlockEditorProvider: ComponentType<any>;
    export const BlockList: ComponentType<any>;
    export const BlockInspectorSidebar: ComponentType<any>;
    export const BlockNavigation: ComponentType<any>;
    export const BlockNavigationList: ComponentType<any>;
    export const BlockNavigationTree: ComponentType<any>;
    export const BlockNavigationTreeItem: ComponentType<any>;
    export const BlockPreview: ComponentType<any>;
    export const BlockSwitcher: ComponentType<any>;
    export const BlockTitleInput: ComponentType<any>;
    export const BlockToolbarButton: ComponentType<any>;
    export const Slot: ComponentType<any>;
    export const Fill: ComponentType<any>;
    // Hooks
    export function useBlockProps(props?: BlockProps): BlockProps;
    export namespace useBlockProps {
        function save(props?: BlockProps): BlockProps;
    }
    export function useInnerBlocksProps(props?: InnerBlocksProps): InnerBlocksProps;
    export function useBlockEditorContext(): any;
    export function useBlockEditContext(): any;
    export function useBlockListContext(): any;
    export function useBlockRef(clientId: string): any;
    export function useBlockSync(): any;
    export function useBlockSelection(): any;
    export function useSelect<T>(mapSelect: (select: any) => T, deps?: any[]): T;
    export function useDispatch(key?: string): any;
    export function useSetting(setting: string): any;
    export function useEntityProp(...args: any[]): any;
    export function useEntityBlockEditor(...args: any[]): any;
    // Experimental/catch-all
    export const __experimentalToolsPanel: ComponentType<any>;
    export const __experimentalBlockVariationPicker: ComponentType<any>;
    export const __experimentalBlockPatternsList: ComponentType<any>;
    export const __experimentalBlockPatternSetup: ComponentType<any>;
    export const __experimentalBlockPatternPreview: ComponentType<any>;
    export const __experimentalBlockVariationList: ComponentType<any>;
    export const __experimentalBlockVariationPicker: ComponentType<any>;
    export const __experimentalBlockVariationToolbar: ComponentType<any>;
    export const __experimentalBlockVariationToolbarButton: ComponentType<any>;
    export const __experimentalBlockVariationToolbarDropdown: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopover: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverContent: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverFooter: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverHeader: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTitle: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTrigger: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerButton: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerIcon: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerLabel: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopover: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverContent: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverFooter: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverHeader: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTitle: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTrigger: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerButton: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerIcon: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerLabel: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopover: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverContent: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverFooter: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverHeader: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTitle: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTrigger: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerButton: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerIcon: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerLabel: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopover: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverContent: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverFooter: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverHeader: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverTitle: ComponentType<any>;
    export const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverTrigger: ComponentType<any>;
    const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerButton: ComponentType<any>;
    const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverTriggerIcon: ComponentType<any>;
    const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverTriggerLabel: ComponentType<any>;
    const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverTriggerPopover: ComponentType<any>;
    const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverContent: ComponentType<any>;
    const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverFooter: ComponentType<any>;
    const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverHeader: ComponentType<any>;
    const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverTitle: ComponentType<any>;
    const __experimentalBlockVariationToolbarPopoverTriggerPopoverTriggerPopoverTriggerPopoverTrigger: ComponentType<any>;
    // ...add more as needed
}

declare module '@wordpress/blocks' {
    export function createBlock(name: string, attributes?: Record<string, any>): any;
    export function getBlockType(name: string): any;
    export function getBlockAttributes(block: any): Record<string, any>;
    export function getBlockDefaultAttributes(name: string): Record<string, any>;
    export function getBlockParents(block: any): any[];
    export function getBlockChildren(block: any): any[];
    export function getBlockSettings(name: string): any;
    export function getBlockSaveContent(block: any): string;
    export function getBlockOrder(block: any): number;
}