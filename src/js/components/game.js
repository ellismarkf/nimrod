import React, {Component} from 'react';
import {shuffle, range, every,} from 'lodash';
import {Motion, spring} from 'react-motion';
import io from 'socket.io-client';
const socket = io.connect();
const rows = range(1,8,2).map( value => {return {count: value}});
const players = range(2).map( (value, index) =>
	{return {host: (index === 0) ? true:false,
			 win:false,
			 selectedRow:null,
			 joined:false,
			 playerId: index,
			 turn: false}
	});
class Stick extends Component {
	constructor(props) { super(props); }
	render() {
		return (<span className='stick' onClick={this.props.onClick}></span>)
	}
}
export class Game extends Component {
	constructor(props) {
		super(props);
		this.state = this.props;
	}
	componentDidMount() {
		socket.on('connected', (data) => {
			this.setState({ mySocketId: data.mySocketId });
		});
		socket.on('newRoomCreated', (data) => {
			this.setState({ gameId: data.gameId });
		});
		socket.on('redraw', this._redraw.bind(this));
		socket.on('gameReady', this._startGame.bind(this));
		socket.on('updateBoard', this._redraw.bind(this));
		socket.on('startNextTurn', (data) => {
			let player = data.role === 0 ? 1 : 0;
			let players = data.players;
			players[player].turn = true;
			players[player].selectedRow = null;
			this.setState({ players: players });
		});
		socket.on('gameOver', (data) => {
			alert(`player ${data.role + 1} loses!`);
		});
	}
	_requestNewRoom() {
		this._playerJoin(0);
		this.setState({role: 0})
		socket.emit('hostRequestNewRoom', this.state);
	}
	_playerJoin(player) {
		let players = this.state.players;
		players[player].joined = true;
		players[player].playerId = this.state.mySocketId;
		this.setState({players: players});
	}
	_player2JoinRoom() {
		this._playerJoin(1)
		this.setState({ role: 1})
		socket.emit('playerJoinGame', this.state);}
	_startGame(data) {
		this._redraw(data);
		let players = this.state.players;
		players[0].turn = true;
		this.setState({ players: players });
	}
	_buildBoard() {
		return range(1,8,2).map( value => {return {count: value} });
	}
	_updateBoard(index, row) {
		let players = this.state.players;
		players[this.state.role].selectedRow = row;
		this.setState({ players: players });
		let rows = this.state.rows;
		rows[row].count--;
		if (rows[row].count === 0) { this._endTurn() }
		if ( every(rows, (row) => { return row.count === 0})) {
			socket.emit('gameOver',
				{ role: this.state.role,
				  gameId: this.state.gameId
				});
		}
		this.setState({ rows: rows });
		socket.emit('updateBoard',
			{
				gameId: this.state.gameId,
				rows: this.state.rows
			}
		);
	}
	_restartGame() { /** todo */ }
	_redraw(data) { this.setState(data); }
	_endTurn() {
		let players = this.state.players;
		players[this.state.role].turn = false;
		this.setState({ players: players });
		socket.emit('turnEnded',
			{
				players: this.state.players,
				gameId: this.state.gameId,
				role: this.state.role
			}
		);
	}
	render() {
		let allPlayersJoined = every(this.state.players, (player) => {
			return player.joined === true
		});
		let noPlayersJoined = every(this.state.players, (player) => {
			return player.joined === false
		});
		let firstPlayerJoined = this.state.players[0].joined === true;
		let secondPlayerJoined = this.state.players[1].joined === true;
		let players = this.state.players;
		let myTurn = this.state.role !== undefined &&
					 players[this.state.role].turn !== undefined ?
					 	players[this.state.role].turn : false;
		let rowChoice = this.state.role !== undefined &&
						players[this.state.role].selectedRow !== null ?
							players[this.state.role].selectedRow : false;
		let rows = this.state.rows.map( (row, rowKey) => {
			return (
				<div className='row' key={rowKey}>
					{ range(row.count).map( (stick, key) => {
						return
						<Stick
							row={rowKey}
							id={key}
							key={key}
							onClick={ rowChoice === false ?
								allPlayersJoined && myTurn ?
							  	this._updateBoard.bind(this, key, rowKey) :
							  	null
							:
								allPlayersJoined &&
								myTurn && rowChoice === rowKey ?
									this._updateBoard.bind(this, key, rowKey) :
									null
							}
				  		/>
			  		}) }
				</div>
			)
		});
		return (
			<div className='board'>
				<button
					className={ players[0].turn === true ?
								'player-btn active' : 'player-btn'}
					onClick={this._requestNewRoom.bind(this)}
					disabled={ allPlayersJoined || firstPlayerJoined ?
								true : false }>
						p1
				</button>
				<button
					className={ players[1].turn === true ?
								'player-btn active' : 'player-btn' }
					onClick={ noPlayersJoined ?
								null : this._player2JoinRoom.bind(this)}
					disabled={  firstPlayerJoined && secondPlayerJoined ?
								true : false }>
					p2
				</button>
				{rows}
				<button className='control-btn'
						onClick={this._endTurn.bind(this) }>
						End Turn
				</button>
			</div>
		)
	}
}
Game.defaultProps = { rows: rows, players: players};