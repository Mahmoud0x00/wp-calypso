/**
 * External dependencies
 */
import React, { Component, FunctionComponent } from 'react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { WPCOMCartItem } from '../types';
import RadioButton from './radio-button';

export type WPCOMProductSlug = string;

export type WPCOMProductVariant = {
	variantLabel: string;
	variantDetails: Component;
	productSlug: WPCOMProductSlug;
};

export type ItemVariationPickerProps = {
	selectedItem: WPCOMCartItem;
	getVariants: ( WPCOMProductSlug ) => WPCOMProductVariant[];
};

export const ItemVariationPicker: FunctionComponent< ItemVariationPickerProps > = ( {
	selectedItem,
	getVariants,
} ) => {
	const selectedProductSlug = selectedItem.wpcom_meta.product_slug;
	const variants = getVariants( selectedProductSlug );

	console.log( variants );

	if ( variants.length < 2 ) {
		return null;
	}

	return <TermOptions>{ variants.map( renderProductVariant( selectedProductSlug ) ) }</TermOptions>;
};

function renderProductVariant(
	selectedProductSlug: WPCOMProductSlug
): ( _0: WPCOMProductVariant, _1: number ) => JSX.Element {
	return ( { variantLabel, variantDetails, productSlug }: WPCOMProductVariant, index: number ) => {
		const translate = useTranslate();
		const key = index.toString() + productSlug;

		return (
			<TermOptionsItem key={ key }>
				<RadioButton
					name={ key }
					id={ key }
					value={ productSlug }
					checked={ productSlug === selectedProductSlug }
					onChange={ () => {
						console.log( 'Select:', variantLabel );
					} }
					ariaLabel={ translate( 'Select ' + variantLabel ) as string }
					label={
						<React.Fragment>
							<VariantLabel>{ translate( variantLabel ) }</VariantLabel>
							{ variantDetails }
						</React.Fragment>
					}
					children={ [] }
				/>
			</TermOptionsItem>
		);
	};
}

const TermOptions = styled.ul`
	flex-basis: 100%;
	margin: 12px 0 0;
	padding: 0;
`;

const TermOptionsItem = styled.li`
	margin: 8px 0 0;
	padding: 0;
	list-style: none;

	:first-of-type {
		margin-top: 0;
	}
`;

const VariantLabel = styled.span`
	flex: 1;
`;
