import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavigationBar from "./NavigationBar";

const Home = () => {
	const isLoggedIn = !!localStorage.getItem('token');
	return (
		<div>
			<NavigationBar/>
			<Container className="w-75 mt-3">
				<h1>Recipe Organizer</h1>
				<p>Witaj w Recipe Organizer, idealnej aplikacji do przechowywania oraz zarządzania swoimi ulubionymi przepisami!</p>
				<p>Rozpocznij od przeglądania przepisów lub utworzenia własnego</p>
				<div className="row">
					<div className="col">
						<Link to="/recipes" className="btn btn-primary w-100">Przeglądaj przepisy</Link>
					</div>
					{isLoggedIn ? (
					<div className="col">
						<Link to="/recipes/add" className="btn btn-outline-primary w-100">Dodaj przepis</Link>
					</div>
						):(<> </>)}
				</div>

			</Container>
		</div>
	);
};

export default Home;
