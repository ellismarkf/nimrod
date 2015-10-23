require('../less/style.less');
import {Game} from './components/game';
import React from 'react';
import { render } from 'react-dom';
render(<Game />, document.getElementById('game'));