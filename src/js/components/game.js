import React, {Component} from 'react';
import {shuffle, range, every,} from 'lodash';
import {Motion, spring} from 'react-motion';
import io from 'socket.io-client';
const socket = io.connect();
const rows = range(1,8,2).map( value => {return {count: value}});
const players = range(2).map( (value, index) => {return {host: (index === 0) ? true:false, win:false, selectedRow:null, joined:false, playerId: index} });

class Stick extends Component {
	constructor(props) { super(props); }
	render() { return (<span className='stick' onClick={this.props.onClick}></span>) }
}

export class Game extends Component {
	constructor(props) {
		super(props);
		this.state = this.props;
	}
	componentDidMount() {
		socket.on('connected', (data) => this.setState({ mySocketId: data.mySocketId }));
		socket.on('newRoomCreated', (data) =>  this.setState({ gameId: data.gameId }));
		socket.on('redraw', this._redraw.bind(this));
		socket.on('gameReady', this._playTurn.bind(this));
		socket.on('updateBoard', this._redraw.bind(this));

	}
	_requestNewRoom() {
		console.log('p1 joined');
		this._playerJoin(0);
		socket.emit('hostRequestNewRoom', this.state);
	}
	_playerJoin(player) {
		let players = this.state.players;
		players[player].joined = true;
		players[player].playerId = this.state.mySocketId;
		this.setState({players: players});
	}
	_player2JoinRoom() {
		console.log('p2 joined');
		this._playerJoin(1)
		socket.emit('playerJoinGame', this.state);}
	_playTurn(data) {
		this._redraw(data);
		this.endTurn();
	}
	buildBoard() { return range(1,8,2).map( value => {return {count: value} }); }
	updateBoard(index, row) {
		let rows = this.state.rows;
		rows[row].count--;
		this.setState({ rows: rows });
		socket.emit('updateBoard', {gameId: this.state.gameId, rows: this.state.rows});
	}
	restoreBoard(){
		let rows = this.buildBoard();
		this.setState({ rows: rows});
	}
	_redraw(data) { this.setState(data); }
	endTurn() {
		let turn = (this.state.hostTurn) ? !this.state.hostTurn : true;
		this.setState({ hostTurn: turn });
		socket.emit('turnEnded', { hostTurn: this.state.hostTurn });
	}
	render() {
		let allPlayersJoined = every(this.state.players, (player) => { return player.joined === true });
		let rows = this.state.rows.map( (row, rowKey) =>
			{ return <div className='row' key={rowKey}>{ range(row.count).map( (stick, key) =>
			 		{ return <Stick row={rowKey} id={key} key={key} onClick={ allPlayersJoined ? this.updateBoard.bind(this, key, rowKey) : null } /> })}
			</div> 
			});
		return (<div className='board'>
					<button disabled={ this.state.players[1].joined === true ? true : false } onClick={this._requestNewRoom.bind(this)}>p1</button>
					<button disabled={ this.state.players[0].joined === true ? false : true } onClick={this._player2JoinRoom.bind(this)}>p2</button>
					{rows}
					<button onClick={this.restoreBoard.bind(this)}>Reset Board</button>
					<button onClick={this.endTurn.bind(this)}>End Turn</button>
				</div>) 
	}
}
Game.defaultProps = { rows: rows, players: players};