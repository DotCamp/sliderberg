declare module '@wordpress/block-editor' {
    export function useBlockProps(props?: Record<string, any>): Record<string, any>;
    export namespace useBlockProps {
        function save(props?: Record<string, any>): Record<string, any>;
    }
}

declare module '@wordpress/blocks' {
    export function registerBlockType(name: string, settings: {
        title: string;
        description: string;
        category: string;
        icon: string;
        supports?: Record<string, any>;
        attributes?: Record<string, any>;
        edit: React.ComponentType<any>;
        save: React.ComponentType<any>;
    }): void;
}

declare module '@wordpress/i18n' {
    export function __(text: string, domain?: string): string;
    export function _x(text: string, context: string, domain?: string): string;
    export function _n(single: string, plural: string, number: number, domain?: string): string;
    export function _nx(single: string, plural: string, number: number, context: string, domain?: string): string;
} 