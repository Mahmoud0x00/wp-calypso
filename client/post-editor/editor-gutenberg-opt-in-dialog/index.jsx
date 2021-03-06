/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import isGutenbergOptInDialogShowing from 'state/selectors/is-gutenberg-opt-in-dialog-showing';
import { hideGutenbergOptInDialog } from 'state/ui/gutenberg-opt-in-dialog/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { setSelectedEditor } from 'state/selected-editor/actions';
import { localize } from 'i18n-calypso';
import { Button, Dialog } from '@automattic/components';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
	bumpStat,
} from 'state/analytics/actions';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';

/**
 * Style dependencies
 */
import './style.scss';

class EditorGutenbergOptInDialog extends Component {
	static propTypes = {
		// connected properties
		translate: PropTypes.func,
		gutenbergUrl: PropTypes.string,
		isDialogVisible: PropTypes.bool,
		hideDialog: PropTypes.func,
		optIn: PropTypes.func,
		useClassic: PropTypes.func,
		siteId: PropTypes.number,
	};

	onCloseDialog = () => {
		this.props.hideDialog();
	};

	optInToGutenberg = () => {
		const { gutenbergUrl, hideDialog, optIn, siteId } = this.props;
		hideDialog();
		optIn( siteId, gutenbergUrl );
	};

	render() {
		const { translate, isDialogVisible, useClassic } = this.props;
		const buttons = [
			<Button key="gutenberg" onClick={ this.optInToGutenberg } primary>
				{ translate( 'Try the block editor' ) }
			</Button>,
			{
				action: 'cancel',
				label: translate( 'Use the current editor' ),
				onClick: useClassic,
			},
		];
		return (
			<Dialog
				additionalClassNames="editor-gutenberg-opt-in-dialog"
				isVisible={ isDialogVisible }
				buttons={ buttons }
				onClose={ this.onCloseDialog }
			>
				<div className="editor-gutenberg-opt-in-dialog__illustration" />

				<header>
					<button onClick={ this.onCloseDialog } className="editor-gutenberg-opt-in-dialog__close">
						<Gridicon icon="cross" />
					</button>
				</header>

				<h1>{ translate( 'Check out the new building blocks of the web' ) }</h1>

				<p className="editor-gutenberg-opt-in-dialog__subhead">
					{ translate(
						'The new WordPress block editor lets you pick from a growing collection of blocks to build your ideal layout.'
					) }
				</p>
			</Dialog>
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	optIn: ( siteId, gutenbergUrl ) => {
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordGoogleEvent(
						'Gutenberg Opt-In',
						'Clicked "Try the new editor" in the editor opt-in sidebar.',
						'Opt-In',
						true
					),
					recordTracksEvent( 'calypso_gutenberg_opt_in', {
						opt_in: true,
					} ),
					bumpStat( 'gutenberg-opt-in', 'Calypso Dialog Opt In' )
				),
				setSelectedEditor( siteId, 'gutenberg', gutenbergUrl )
			)
		);
	},
	useClassic: () => {
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordGoogleEvent(
						'Gutenberg Opt-Out',
						'Clicked "Use the classic editor" in the editor opt-in sidebar.',
						'Opt-In',
						false
					),
					recordTracksEvent( 'calypso_gutenberg_use_classic_editor' ),
					bumpStat( 'selected-editor', 'calypso-gutenberg-use-classic-editor' )
				),
				hideGutenbergOptInDialog()
			)
		);
	},
	hideDialog: () => dispatch( hideGutenbergOptInDialog() ),
} );

export default connect( state => {
	const isDialogVisible = isGutenbergOptInDialogShowing( state );
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );

	const gutenbergUrl = getGutenbergEditorUrl( state, siteId, postId, postType );

	return {
		gutenbergUrl,
		isDialogVisible,
		siteId,
	};
}, mapDispatchToProps )( localize( EditorGutenbergOptInDialog ) );
