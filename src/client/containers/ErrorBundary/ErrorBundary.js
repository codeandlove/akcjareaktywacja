import React, {Component} from "react";
import picture from "../../../assets/picture.webp";
import './ErrorBundary.scss';

class ErrorBoundary extends Component {
    constructor() {
        super();

        this.state = {
            hasError: false
        }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.log(error, errorInfo);
    }

    render() {
        const {hasError} = this.state;

        if (hasError) {
            return (
                <div className="bug-container">
                    <img src={picture} className="picture-img" alt="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." title="Wyjdź z domu i poznaj nowych ludzi. Grupowe spotkania na żywo." />
                    <strong>Przepraszamy, coś poszło nie tak... Wróć do nas za parę minut.</strong>
                    <p>Jeśli problem się powtarza, daj nam znać na: <a href="mailto:akcjareaktywacjaofficial@gmail.com">akcjareaktywacjaofficial@gmail.com</a></p>
                </div>
            )
        }

        return this.props.children;
    }
}

export default ErrorBoundary;