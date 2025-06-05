import React from 'react';
import { Edit as SliderEdit } from '../../components/slider/Edit';
import { SliderAttributes } from '../../types/slider';

interface EditProps {
    attributes: SliderAttributes;
    setAttributes: (attrs: Partial<SliderAttributes>) => void;
    clientId?: string;
}

export const Edit = (props: EditProps) => {
    return <SliderEdit {...props} clientId={props.clientId || ''} />;
}; 