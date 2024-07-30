#!/usr/bin/env python3
"""
A Basic Flask app with Babel for internationalization.
"""
from flask_babel import Babel
from flask import Flask, render_template, request
import logging
import os


class Config:
    """Represents a Flask Babel configuration."""
    LANGUAGES = ["en", "fr"]
    BABEL_DEFAULT_LOCALE = os.getenv('BABEL_DEFAULT_LOCALE', 'en')
    BABEL_DEFAULT_TIMEZONE = os.getenv('BABEL_DEFAULT_TIMEZONE', 'UTC')


app = Flask(__name__)
app.config.from_object(Config)
app.url_map.strict_slashes = False
babel = Babel(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@babel.localeselector
def get_locale() -> str:
    """
    Retrieves the best match for supported languages based on the request
    Returns:
        str: The best match locale.
    """
    locale = request.accept_languages.best_match(app.config["LANGUAGES"])
    logger.info(f"Selected locale: {locale}")
    return locale


@app.route('/')
def get_index() -> str:
    """
    The home/index page
    Returns:
        str: Rendered HTML template for the index page.
    """
    try:
        return render_template('2-index.html')
    except Exception as e:
        logger.error(f"Error rendering template: {e}")
        return "An error occurred", 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
