import { useState, useEffect } from 'react';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { createBlock, cloneBlock } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';

type BlockEditorSelect = {
	getBlocks: ( clientId: string ) => any[];
	getBlock: ( clientId: string ) => any;
	getBlockIndex: ( clientId: string, rootClientId: string ) => number;
};

export const useSliderState = ( clientId: string, attributes: any ) => {
	const [ currentSlideId, setCurrentSlideId ] = useState< string | null >(
		null
	);
	const [ isUpdating, setIsUpdating ] = useState( false );

	// Get the current inner blocks for this slider
	const innerBlocks = useSelect(
		( select: any ) =>
			clientId ? select( blockEditorStore ).getBlocks( clientId ) : [],
		[ clientId ]
	);

	const { insertBlock, removeBlock, insertBlocks } =
		useDispatch( blockEditorStore );

	const { getBlock, getBlockIndex } = useSelect( ( select ) => {
		const editorSelect = select( blockEditorStore ) as BlockEditorSelect;
		return {
			getBlock: editorSelect.getBlock,
			getBlockIndex: editorSelect.getBlockIndex,
		};
	}, [] );

	// Set the first slide as current by default if not set or if current slide no longer exists
	useEffect( () => {
		if ( innerBlocks.length > 0 ) {
			const currentSlideExists =
				currentSlideId &&
				innerBlocks.some( ( b: any ) => b.clientId === currentSlideId );
			if ( ! currentSlideExists ) {
				setCurrentSlideId( innerBlocks[ 0 ].clientId );
				if (
					typeof window !== 'undefined' &&
					window.updateSliderbergSlidesVisibility
				) {
					window.updateSliderbergSlidesVisibility();
				}
			}
		}
	}, [ innerBlocks ] );

	// Handle visibility updates after state changes
	useEffect( () => {
		if (
			isUpdating &&
			typeof window !== 'undefined' &&
			window.updateSliderbergSlidesVisibility
		) {
			window.updateSliderbergSlidesVisibility();
			setIsUpdating( false );
		}
	}, [ isUpdating ] );

	const handleSlideChange = ( slideId: string ) => {
		setCurrentSlideId( slideId );
		if (
			typeof window !== 'undefined' &&
			window.updateSliderbergSlidesVisibility
		) {
			window.updateSliderbergSlidesVisibility();
		}
	};

	const handleAddSlide = () => {
		// Store current scroll position
		const scrollTop =
			window.pageYOffset || document.documentElement.scrollTop;
		const scrollLeft =
			window.pageXOffset || document.documentElement.scrollLeft;

		const slideBlock = createBlock( 'sliderberg/slide' );

		// insertBlock with updateSelection: false to prevent auto-scroll
		insertBlock( slideBlock, innerBlocks.length, clientId, false );

		setTimeout( () => {
			const updatedBlocks = (
				select( blockEditorStore ) as BlockEditorSelect
			 ).getBlocks( clientId );
			const newBlock = updatedBlocks[ updatedBlocks.length - 1 ];
			if ( newBlock ) {
				// If carousel mode, set currentSlideId to the first of the last N slides
				if (attributes.isCarouselMode && attributes.slidesToShow > 1) {
					const firstVisibleIdx = Math.max(updatedBlocks.length - attributes.slidesToShow, 0);
					const firstVisibleBlock = updatedBlocks[firstVisibleIdx];
					if (firstVisibleBlock) {
						setCurrentSlideId(firstVisibleBlock.clientId);
					} else {
						setCurrentSlideId(newBlock.clientId);
					}
				} else {
					setCurrentSlideId(newBlock.clientId);
				}
				setIsUpdating( true );

				// Restore scroll position if it changed
				setTimeout( () => {
					window.scrollTo( scrollLeft, scrollTop );
				}, 10 );
			}
		}, 20 );
	};

	const handleDeleteSlide = () => {
		if ( innerBlocks.length <= 1 ) return;

		const currentIndex = innerBlocks.findIndex(
			( block: any ) => block.clientId === currentSlideId
		);
		const nextIndex = ( currentIndex + 1 ) % innerBlocks.length;
		const nextSlideId = innerBlocks[ nextIndex ].clientId;

		removeBlock( currentSlideId );
		setCurrentSlideId( nextSlideId );
		setIsUpdating( true );
	};

	const handleDuplicateSlide = ( slideIdToDuplicate: string ) => {
		if ( ! slideIdToDuplicate ) return;

		// Store current scroll position
		const scrollTop =
			window.pageYOffset || document.documentElement.scrollTop;
		const scrollLeft =
			window.pageXOffset || document.documentElement.scrollLeft;

		const originalBlock = getBlock( slideIdToDuplicate );
		if ( ! originalBlock ) return;

		const duplicatedBlock = cloneBlock( originalBlock );
		if ( ! duplicatedBlock ) return;

		const originalSlideIndex = getBlockIndex(
			slideIdToDuplicate,
			clientId
		);
		const insertionPoint =
			originalSlideIndex !== -1
				? originalSlideIndex + 1
				: innerBlocks.length;

		// insertBlocks with updateSelection: false to prevent auto-scroll
		insertBlocks( duplicatedBlock, insertionPoint, clientId, false );

		setTimeout( () => {
			setCurrentSlideId( duplicatedBlock.clientId );
			setIsUpdating( true );

			// Restore scroll position if it changed
			setTimeout( () => {
				window.scrollTo( scrollLeft, scrollTop );
			}, 10 );
		}, 20 );
	};

	return {
		currentSlideId,
		innerBlocks,
		handleSlideChange,
		handleAddSlide,
		handleDeleteSlide,
		handleDuplicateSlide,
	};
};
