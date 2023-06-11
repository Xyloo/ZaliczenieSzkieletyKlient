import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavigationBar from "./NavigationBar";

const Login = () => {
    useEffect(() => {
        document.title = 'Recipe Organizer | Logowanie';
    }, []);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loginResult, setLoginResult] = useState('');
    const [validated, setValidated] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevState) => {
            return {
                ...prevState,
                [name]: value,
            };
        });
        setValidated(true)
    };

    const { email, password } = formData;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
        }
        setValidated(true);
        if(form.checkValidity() === false) return;
        try {
            const url = 'https://localhost:8443/api/login';
            const { data: res } = await axios.post(url, formData);
            localStorage.setItem('token', res.token);
            setLoginResult('Logowanie udane');
            setTimeout(() => {window.location = "/"}, 1000);
        } catch (err) {
            console.log(err);
            if (err.response && err.response.data && err.response.data.error) {
                setLoginResult(err.response.data.error);
            }
        }
    };

    return (
        <div>
            <NavigationBar/>
        <div className="container d-flex justify-content-center align-items-center mt-3">
            <div className="card w-50">
                <div className="card-body">
                    <h2 className="card-title">Logowanie</h2>
                    {loginResult && (
                        <Alert variant={loginResult === 'Logowanie udane' ? 'success' : 'danger'}>
                            {loginResult}
                        </Alert>
                    )}
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
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
                                Podaj poprawny adres email
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Hasło</Form.Label>
                            <Form.Control
                                name="password"
                                type="password"
                                value={password}
                                required
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+\-]).{8,32}$"
                                onChange={handleChange}
                            />
                            <Form.Control.Feedback type="invalid">
                                Hasło jest wymagane i musi zawierać od 8 do 32 znaków, w tym co najmniej<ul><li>jedną małą literę</li><li>jedną dużą literę</li><li>jedną cyfrę</li><li>jeden znak specjalny</li></ul>
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button type="submit" variant="primary">
                            Zaloguj
                        </Button>
                    </Form>
                    <div className="mt-3">
                        <Link to="/register">
                            Nie masz konta? Zarejestruj się!
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Login;