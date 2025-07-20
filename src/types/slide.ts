export interface MediaObject {
	id: number;
	url: string;
}

export interface FocalPoint {
	x: number;
	y: number;
}

export type ContentPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'center-left'
	| 'center-center'
	| 'center-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export interface SlideAttributes {
	backgroundType: 'image' | 'color';
	backgroundImage: MediaObject | null;
	backgroundColor: string;
	focalPoint: FocalPoint;
	overlayColor: string;
	overlayOpacity: number;
	minHeight: number;
	contentPosition: ContentPosition;
	isFixed: boolean;
	isContained: boolean;
}

export interface SlideEditProps {
	attributes: SlideAttributes;
	setAttributes: ( attrs: Partial< SlideAttributes > ) => void;
	isSelected: boolean;
	clientId: string;
}

export interface MediaUploadRenderProps {
	open: () => void;
}
