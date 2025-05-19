export interface HTMLElementWithDataClientId extends HTMLElement {
    getAttribute(name: string): string | null;
    style: CSSStyleDeclaration;
}

export interface BaseComponentProps {
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
} 