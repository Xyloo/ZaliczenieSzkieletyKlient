import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavigationBar from './NavigationBar';

const Register = () => {
	useEffect(() => {
		document.title = 'Recipe Organizer | Rejestracja';
	}, []);

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
	});

	const [registerResult, setRegisterResult] = useState('');
	const [validated, setValidated] = useState(false);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevState) => {
			return {
				...prevState,
				[name]: value,
			};
		});
		setValidated(true);
	};

	const { firstName, lastName, email, password } = formData;

	const handleSubmit = async (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		if (form.checkValidity() === false) {
			e.stopPropagation();
		}
		setValidated(true);
		if (form.checkValidity() === false) return;
		try {
			const url = 'https://localhost:8443/api/register';
			const { data: res } = await axios.post(url, formData);
			localStorage.setItem('token', res.token);
			setRegisterResult('Rejestracja udana');
			setTimeout(() => {
				window.location = '/';
			}, 1000);
		} catch (err) {
			console.log(err);
			if (err.response && err.response.data && err.response.data.error) {
				setRegisterResult(err.response.data.error);
			}
		}
	};

	return (
		<div>
			<NavigationBar />
			<div className="container d-flex justify-content-center align-items-center mt-3">
				<div className="card w-50">
					<div className="card-body">
						<h2 className="card-title">Rejestracja</h2>
						{registerResult && (
							<Alert variant={registerResult === 'Rejestracja udana' ? 'success' : 'danger'}>
								{registerResult}
							</Alert>
						)}
						<Form noValidate validated={validated} onSubmit={handleSubmit}>
							<Form.Group className="mb-3" controlId="firstName">
								<Form.Label>Imię</Form.Label>
								<Form.Control
									name="firstName"
									type="text"
									value={firstName}
									required
									onChange={handleChange}
								/>
								<Form.Control.Feedback type="invalid">
									Imię jest wymagane
								</Form.Control.Feedback>
							</Form.Group>
							<Form.Group className="mb-3" controlId="lastName">
								<Form.Label>Nazwisko</Form.Label>
								<Form.Control
									name="lastName"
									type="text"
									value={lastName}
									required
									onChange={handleChange}
								/>
								<Form.Control.Feedback type="invalid">
									Nazwisko jest wymagane
								</Form.Control.Feedback>
							</Form.Group>
							<Form.Group className="mb-3" controlId="email">
								<Form.Label>Email</Form.Label>
								<Form.Control
									name="email"
									type="email"
									value={email}
									required
									onChange={handleChange}
								/>
								<Form.Control.Feedback type="invalid">
									Email jest wymagany
								</Form.Control.Feedback>
							</Form.Group>
							<Form.Group className="mb-3" controlId="password">
								<Form.Label>Hasło</Form.Label>
								<Form.Control
									name="password"
									type="password"
									value={password}
									onChange={handleChange}
									required
									pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+\-]).{8,32}$"
								/>
								<Form.Control.Feedback type="invalid">
									Hasło jest wymagane i musi zawierać od 8 do 32 znaków, w tym co najmniej
									<ul>
										<li>jedną małą literę</li>
										<li>jedną dużą literę</li>
										<li>jedną cyfrę</li>
										<li>jeden znak specjalny</li>
									</ul>
								</Form.Control.Feedback>
							</Form.Group>
							<Button type="submit" variant="primary">
								Zarejestruj
							</Button>
						</Form>
						<div className="mt-3">
							<Link to="/login">Masz już konto? Zaloguj się!</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;
