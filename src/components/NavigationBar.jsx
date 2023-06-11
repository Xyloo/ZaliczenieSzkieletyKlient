import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

const NavigationBar = () => {
	const isLoggedIn = !!localStorage.getItem('token');

	const handleLogout = () => {
		localStorage.removeItem('token');
		window.location.reload(); // Odświeżenie strony, przekierowanie na stronę logowania
	};

	return (
		<Navbar bg="light" expand="lg">
			<Container>
				<Navbar.Brand href="/">Recipe Organizer</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link href="/recipes">Przeglądaj przepisy</Nav.Link>
						{isLoggedIn ? (
						<Nav.Link href="/recipes/add">Dodaj przepis</Nav.Link>
							):(<> </>)}
					</Nav>
					<Nav>
						{isLoggedIn ? (
							<>
								<Nav.Link href="/profile">Profil</Nav.Link>
								<Nav.Link onClick={handleLogout}>Wyloguj się</Nav.Link>
							</>
						) : (
							<>
								<Nav.Link href="/login">Logowanie</Nav.Link>
								<Nav.Link href="/register">Rejestracja</Nav.Link>
							</>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default NavigationBar;
