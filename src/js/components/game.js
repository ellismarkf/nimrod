import React, {Component} from 'react';
import {shuffle, range, every,} from 'lodash'

const rows = range(1,8,2).map( value => {return {count: value}});

class Stick extends Component {
	constructor(props) { super(props); }
	render() { return (<span className='stick'>{this.props.row}</span>) }
}

class NimRow extends Component {
	constructor(props) { super(props); }
	render() {
		let sticks = (this.props.sticks === 1 ) ? <Stick row={this.props.row}/> : range(this.props.sticks).map( (stick, key) => { return <Stick row={this.props.row} key={key} /> });
		return  (<div className='row'>{sticks}</div>);
	}
}

export class Game extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rows: this.props.rows
		}
	}
	render() {
		return (<div className='board'>
					{ this.state.rows.map( (row, key) => { return ( <NimRow sticks={row.count} row={key} key={key} /> )}) }
				</div>);
	}
}
Game.defaultProps = { rows: rows};