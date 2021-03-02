import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
	state = {
		seenIndexes: [],
		values: {},
		index: '',
	};

	componentDidMount() {
		this.fetchValues();
		this.fetchIndexes();
	}

	async fetchValues() {
		const values = await axios.get('/api/values/current');
		this.setState({ values: values.data });
	}

	async fetchIndexes() {
		const seenIndexes = await axios.get('/api/values/all');
		this.setState({ seenIndexes: seenIndexes.data });
	}

	handleSubmit = async (e) => {
		e.preventDefault();

		await axios.post('/api/values', {
			index: this.state.index,
		});

		this.setState({ index: '' });
	};

	renderSeenIndexes() {
		const { seenIndexes } = this.state;
		return seenIndexes.map((i) => i.number).join(', ');
	}

	renderValues() {
		const { values } = this.state;
		const entries = [];
		for (let key in values) {
			entries.push(
				<div key={key}>
					For index {key} I calculated {values[key]}
				</div>
			);
		}
		return entries;
	}

	render() {
		const { index } = this.state;
		return (
			<div>
				<form onSubmit={this.handleSubmit}>
					<label>Index</label>
					<input
						type="number"
						value={index}
						onChange={(e) => this.setState({ index: e.target.value })}
					/>
					<button type="submit">Submit</button>
				</form>

				<h3>Indexes seen</h3>
				{this.renderSeenIndexes()}

				<h3>Calculated values</h3>
				{this.renderValues()}
			</div>
		);
	}
}

export default Fib;
