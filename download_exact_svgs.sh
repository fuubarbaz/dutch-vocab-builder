#!/bin/bash
set -e

DIR="src/assets/images/traffic_signs"
mkdir -p "$DIR"

# Exact Wikimedia Commons SVG URLs verified directly
curl -L -A "DutchVocabApp/1.0" -o "$DIR/stopbord.svg" "https://upload.wikimedia.org/wikipedia/commons/e/ea/Nederlands_verkeersbord_B7.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/verkeerslicht.svg" "https://upload.wikimedia.org/wikipedia/commons/5/5e/Nederlands_verkeersbord_J9.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/voorrang.svg" "https://upload.wikimedia.org/wikipedia/commons/1/14/Nederlands_verkeersbord_B6.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/snelweg.svg" "https://upload.wikimedia.org/wikipedia/commons/a/af/Nederlands_verkeersbord_G3.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/rotonde.svg" "https://upload.wikimedia.org/wikipedia/commons/3/3d/Nederlands_verkeersbord_D12.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/zebrapad.svg" "https://upload.wikimedia.org/wikipedia/commons/4/4b/Nederlands_verkeersbord_L2.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/parkeren.svg" "https://upload.wikimedia.org/wikipedia/commons/0/08/Nederlands_verkeersbord_E4.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/eenrichtingsverkeer.svg" "https://upload.wikimedia.org/wikipedia/commons/e/ec/Nederlands_verkeersbord_C2.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/snelheidslimiet.svg" "https://upload.wikimedia.org/wikipedia/commons/2/25/Nederlands_verkeersbord_A1-50.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/omleiding.svg" "https://upload.wikimedia.org/wikipedia/commons/1/11/20161226084627%21Netherlands_road_sign_route_deviation.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/inhalen.svg" "https://upload.wikimedia.org/wikipedia/commons/f/fb/Nederlands_verkeersbord_F1.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/doodlopende_weg.svg" "https://upload.wikimedia.org/wikipedia/commons/6/64/Nederlands_verkeersbord_L8.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/fietspad.svg" "https://upload.wikimedia.org/wikipedia/commons/7/77/Nederlands_verkeersbord_G11.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/let_op.svg" "https://upload.wikimedia.org/wikipedia/commons/7/7b/Nederlands_verkeersbord_J37.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/verplicht.svg" "https://upload.wikimedia.org/wikipedia/commons/7/77/Nederlands_verkeersbord_G11.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/kruising.svg" "https://upload.wikimedia.org/wikipedia/commons/0/07/Nederlands_verkeersbord_J8.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/voorrangsweg.svg" "https://upload.wikimedia.org/wikipedia/commons/3/30/Nederlands_verkeersbord_B1.svg"
curl -L -A "DutchVocabApp/1.0" -o "$DIR/gevaar.svg" "https://upload.wikimedia.org/wikipedia/commons/7/7b/Nederlands_verkeersbord_J37.svg"

ls -laSh $DIR/*.svg
