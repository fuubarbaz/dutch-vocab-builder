import urllib.request
import json
import os

from html.parser import HTMLParser

DEST_DIR = os.path.join(os.path.dirname(__file__), 'src', 'assets', 'images', 'traffic_signs', 'all')
os.makedirs(DEST_DIR, exist_ok=True)

WIKI_URL = "https://en.wikipedia.org/wiki/Road_signs_in_the_Netherlands"
USER_AGENT = "DutchVocabApp/1.0 (Contact: me@example.com) Node.js/18"

class WikiParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_gallery = False
        self.in_gallery_text = False
        self.categories = []
        
        self.current_img_url = None
        self.current_code = None
        self.current_desc = None
        
        self.in_h2 = False
        self.h2_text = ""
        self.last_h2_text = "General"

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        
        if tag == "h2":
            self.in_h2 = True
            self.h2_text = ""
            
        if tag == "ul" and "class" in attr_dict and "gallery" in attr_dict["class"]:
            self.in_gallery = True
            # When a gallery starts, we create a new category based on the last h2 we saw
            # Ensure we don't duplicate if there are multiple galleries under one h2
            cat_id = f"traffic_{self.last_h2_text.lower().replace(' ', '_')}"
            
            # Check if category already exists
            existing_cat = next((c for c in self.categories if c["id"] == cat_id), None)
            if not existing_cat:
                self.categories.append({
                    "id": cat_id,
                    "title": self.last_h2_text,
                    "words": []
                })

        if self.in_gallery and tag == "img":
            if "src" in attr_dict:
                src = attr_dict["src"]
                if src.startswith("//"):
                    src = "https:" + src
                self.current_img_url = src

        if self.in_gallery and tag == "div" and "class" in attr_dict and "gallerytext" in attr_dict["class"]:
            self.in_gallery_text = True
            self.current_code = ""
            self.current_desc = ""

    def handle_data(self, data):
        if self.in_h2:
            self.h2_text += data.strip()
            
        if self.in_gallery_text:
            text = data.strip()
            if text:
                if not self.current_code:
                    parts = text.split(":", 1)
                    if len(parts) > 1:
                        self.current_code = parts[0].strip()
                        self.current_desc = parts[1].strip()
                    else:
                        pieces = text.split(" ")
                        if len(pieces) > 0:
                             self.current_code = pieces[0].strip()
                             self.current_desc = (" ".join(pieces[1:]) if len(pieces) > 1 else "").strip()
                elif not self.current_desc:
                    self.current_desc = text

    def handle_endtag(self, tag):
        if tag == "h2":
            self.in_h2 = False
            if self.h2_text and not self.h2_text.lower() in ["contents", "see also", "references", "external links"]:
                 self.last_h2_text = self.h2_text
                     
        if tag == "div" and self.in_gallery_text:
            self.in_gallery_text = False
            if self.current_code and self.current_img_url and len(self.categories) > 0:
                word_id = self.current_code.lower().replace("-", "_").replace(",", "").replace("/", "").replace(" ", "_")
                
                # Sometime description has internal HTML we missed stripping perfectly. Basic cleanup:
                clean_desc = self.current_desc.replace("<p>", "").replace("</p>", "").replace("<a>", "").replace("</a>", "")
                
                self.categories[-1]["words"].append({
                    "id": f"tr_{word_id}",
                    "dutch": self.current_code, 
                    "english": clean_desc,
                    "exampleDutch": "",
                    "exampleEnglish": "",
                    "img_url": self.current_img_url,
                    "filename": f"{word_id}.png"
                })
                self.current_code = None
                self.current_desc = None
                self.current_img_url = None

        if tag == "ul" and self.in_gallery:
            self.in_gallery = False

def run():
    print("Downloading Wikipedia page...")
    req = urllib.request.Request(WIKI_URL, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')

    print("Parsing HTML...")
    parser = WikiParser()
    parser.feed(html)

    categories = [c for c in parser.categories if len(c["words"]) > 0]
    print(f"Parsed {len(categories)} actual sign categories.")
    
    total_words = sum(len(c["words"]) for c in categories)
    print(f"Parsed {total_words} total signs. Downloading images...")
    
    if total_words == 0:
        print("Error: No signs found. Exiting.")
        return

    for cat in categories:
        for word in cat["words"]:
            url = word["img_url"]
            filename = word["filename"]
            dest = os.path.join(DEST_DIR, filename)
            
            if not os.path.exists(dest):
                try:
                    import subprocess
                    result = subprocess.run([
                        "curl", "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 
                        "-s", "-L", "-o", dest, url
                    ])
                    if result.returncode == 0:
                        print(f"Downloaded {filename}")
                    else:
                        print(f"Curl failed for {filename} with code {result.returncode}")
                except Exception as e:
                    print(f"Failed to download {filename} from {url}: {e}")
            
            del word["img_url"]

    json_path = os.path.join(DEST_DIR, "scraped_data.json")
    with open(json_path, "w") as f:
        json.dump(categories, f, indent=4)
    print(f"Data written to {json_path}")

if __name__ == "__main__":
    run()
