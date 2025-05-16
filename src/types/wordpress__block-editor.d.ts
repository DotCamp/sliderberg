import { createBlock } from '@wordpress/blocks';
import { ComponentType, ReactNode } from 'react';

declare module '@wordpress/block-editor' {
    interface BlockProps {
        className?: string;
        [key: string]: any;
    }

    interface InnerBlocksProps {
        allowedBlocks?: string[];
        template?: Array<[string, Record<string, any>]>;
        templateLock?: boolean | 'all' | 'insert';
        renderAppender?: () => ReactNode;
        orientation?: 'horizontal' | 'vertical';
    }

    interface BlockControlsProps {
        children: ReactNode;
    }

    interface InspectorControlsProps {
        children: ReactNode;
    }

    interface MediaUploadProps {
        onSelect: (media: any) => void;
        allowedTypes?: string[];
        value?: number;
        render: (props: { open: () => void }) => ReactNode;
    }

    interface MediaUploadCheckProps {
        children: ReactNode;
    }

    interface BlockEditorStore {
        getBlocks: (clientId: string) => Block[];
    }

    export function useBlockProps(props?: BlockProps): BlockProps;
    export function useBlockProps(props?: { className?: string }): { className: string };
    export function useInnerBlocksProps(props?: InnerBlocksProps): InnerBlocksProps;
    export function useBlockEditorContext(): {
        insertBlock: (block: Block, clientId?: string, targetClientId?: string) => void;
    };
    
    export const InnerBlocks: ComponentType<InnerBlocksProps> & {
        Content: ComponentType;
    };

    export const BlockControls: ComponentType<BlockControlsProps>;
    export const InspectorControls: ComponentType<InspectorControlsProps>;
    export const MediaUpload: ComponentType<MediaUploadProps>;
    export const MediaUploadCheck: ComponentType<MediaUploadCheckProps>;
    export const BlockAlignmentToolbar: ComponentType<BlockAlignmentToolbarProps>;

} 

declare module '@wordpress/blocks' {
    export function createBlock(name: string, attributes?: Record<string, any>): Block;

}