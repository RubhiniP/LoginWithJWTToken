import React, { useState, useRef, useEffect } from 'react';
import {
    TextField,
    Button,
    Typography,
    Box,
    Container,
    InputAdornment
} from '@mui/material';
import forge from 'node-forge';

const LeadForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });

    const [openIframe, setOpenIframe] = useState(false);
    const iframeRef = useRef(null);

    const base64UrlEncode = (input) => {
        return btoa(input)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    };

    useEffect(() => {
        const generateToken = () => {
            const header = {
                alg: "HS256",
                typ: "JWT",
            };
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phoneNumber
            };
            const secretKey = "erjfeorijoiejoirjfoeioaieowweaxcn";
            const encodedHeader = base64UrlEncode(JSON.stringify(header));
            const encodedPayload = base64UrlEncode(JSON.stringify(payload));
            const hmac = forge.hmac.create();
            hmac.start('SHA256', secretKey);
            hmac.update(`${encodedHeader}.${encodedPayload}`);
            const encodedSignature = base64UrlEncode(hmac.digest().getBytes());
            return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
        };

        const handlePostMessage = event => {
            if (event.data.type === 'ready_for_auth' && event.data.value === true) {
                const generatedJWTToken = generateToken();                
                const message = {
                    type: 'prosect_data_submit',
                    token: generatedJWTToken,
                };
                if (iframeRef.current) {
                    iframeRef.current.contentWindow.postMessage(message, '*');
                }
            }
        };

        window.addEventListener('message', handlePostMessage);
        return () => {
            window.removeEventListener('message', handlePostMessage);
        };
    }, [formData, openIframe]);

    const formatPhoneNumber = value => {
        let phoneNumber = value.replace(/[^\d]/g, '');
        if (phoneNumber.length > 3 && phoneNumber.length <= 6) {
            phoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        } else if (phoneNumber.length > 6) {
            phoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        } else if (phoneNumber.length <= 3) {
            phoneNumber = `${phoneNumber}`;
        }
        return phoneNumber;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'firstName' || name === 'lastName') {
            if (/[^a-zA-Z]/.test(value)) {
                return;
            }
        }
        if (name === 'phoneNumber') {
            if (/[^0-9]/.test(value.replace(/\D/g, ''))) {
                return;
            }
            if (value.replace(/\D/g, '').length <= 10) {
                setFormData((prevState) => ({
                    ...prevState,
                    [name]: formatPhoneNumber(value)
                }));
            }
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setOpenIframe(true);
    };

    if (openIframe) {
        return (
            <iframe
                ref={iframeRef}
                id="iframedContainer"
                src="https://homes.qe.rentlyaura.com/homes-for-rent/properties/4549898?source=iframe&companyID=12698"
                title="Iframe for Self Tour"
                style={{
                    width: '100%',
                    height: '100vh',
                    border: 'none'
                }}
            />
        );
    }

    return (
        <Container
            maxWidth="sm"
            style={{
                marginTop: '10px',
                padding: '30px',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)'
            }}
        >
            <Box component="form" onSubmit={handleSubmit}>
                <Typography
                    variant="h4"
                    component="h2"
                    align="center"
                    sx={{
                        fontWeight: 600,
                        mb: 4,
                        fontSize: '20px',
                    }}
                >
                    LOOKING FOR A HOME?
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        fullWidth
                        name="firstName"
                        label="First Name"
                        variant="outlined"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        name="lastName"
                        label="Last Name"
                        variant="outlined"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        name="email"
                        label="Email"
                        type="email"
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        name="phoneNumber"
                        label="Phone Number"
                        type="tel"
                        variant="outlined"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">+1</InputAdornment>
                        }}
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '16px',
                            color: 'white',
                            backgroundColor: '#84bd00',
                            fontWeight: 600,
                            padding: '10px',
                        }}
                    >
                        SELF TOUR NOW
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default LeadForm;
