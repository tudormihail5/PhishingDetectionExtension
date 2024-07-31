# Phishing Detection Extension

### What it does:

The phishing detection software is complemented by a browser extension as well, making the phishing detection process even easier. When navigating a suspicious website, the user will click the extension icon, and if the website is in English, they will click the 'English'. If not, the other button should be clicked.

![PhishingExtension1](https://github.com/tudormihail5/PhishingDetectionExtension/blob/main/Screenshot1.png)

The extension uses the software's phishing detection methods, and it will display the results when they are ready.

![PhishingExtension2](https://github.com/tudormihail5/PhishingDetectionExtension/blob/main/Screenshot2.png)

![PhishingExtension3](https://github.com/tudormihail5/PhishingDetectionExtension/blob/main/Screenshot3.png)

### How I built it:

I used Django, as it provides numerous built-in security features that help developers avoid common security mistakes, such as SQL injection, cross-site scripting, cross-site request forgery, and clickjacking. HTML was essential in designing the interfaces, while CSS was used for styling the HTML elements, enhancing the user interface of the system. JavaScript was used to enhance the interactivity and functionality of the software’s interface, and the user experience. The URLs and the results are stored in a SQLite database, as it is easy to integrate and manage.

After the user clicks 'Check URL', the system uses the 'virustotal' method to check whether the link triggers any file download, and check if it is malicious or not, displaying the corresponding result. If it does not download any file, it uses the other 3 methods: 'random_forest', 'urgency_trust_spelling' (only if the user checked the 'Website in English' box), and 'check_blacklists'. When the analysis is ready, it displays the results and stores it in the database, which is entirely displayed on the 'History' page.

- 'virustotal': First, the function prepares a Selenium WebDriver environment to visit a given URL. It sets Chrome to run in headless mode (no GUI) and specifies a download directory within the script’s current directory. The script checks if the download directory exists, and if not, it creates it. After navigating to the URL, the script waits 8 seconds to allow any files to be downloaded automatically. This waiting period assumes that the file will be downloaded within this timeframe, ensuring it is enough time for the download, and not too long to slow down the system. The method uploads the downloaded file to VirusTotal using the API key stored in an environmental variable. It then waits asynchronously for the analysis to complete. VirusTotal analysis involves checking the file against multiple antiviruses engines and databases to determine if it is malicious. If the file is flagged by four or more detections, threshold suggested by the research, it is considered potentially harmful ('P'). Otherwise, it is considered safe ('L'). Regardless of the analysis outcome, the downloaded file is deleted to clean up.

- 'random_forest': This is the most complex technique used by the phishing detection, using a Random Forest model and 26 technical attributes of the webpage to predict if the website is phishing. To ensure the model will get the best possible accuracy, the Random Forest algorithm was implemented from scratch and then compared with the Scikit-Learn implementation. For training the model, a dataset was used. It contains 11055 websites divided into 26 attributes that were proved to be effective in predicting phishing websites. The attributes are represented as -1 (legitimate), 0 (suspicious), or 1 (phishing). The 27rd attribute represents the result, whether the website was proved to be phishing or not. The big dataset was divided into 70% for training, 15% for validation, and 15% for testing. The training and validation datasets were loaded from CSV into Pandas dataframes. The data was then prepared by separating features from the target variable, with the training data converted to a list of lists for compatibility with the Random Forest implementation. The hyperparameters are defined within a search space using Hyperopt’s 'hp.quniform', which allows specifying a range for each parameter. A function is defined to train the Random Forest model with a given set of parameters, make predictions on the validation data, and calculate the accuracy. The loss is defined as '1 - accuracy', where a lower loss indicates a better performance. The function returns a dictionary that Hyperopt uses to evaluate and select the best hyperparameters. Hyperopt’s “fmin” function is used to perform the optimisation, with the Tree-structured Parzen Estimator (TPE) method selected as the algorithm for exploring the hyperparameter space. The process is run for a maximum of 50 evaluations, with the results and progress being tracked using the 'Trials' object. After optimisation, the best set of hyperparameters is extracted and printed. Additionally, the best validation accuracy obtained during the optimisation process is determined by iterating over all trials and identifying the highest accuracy recorded. After this step, the model was tested using the testing database, and the accuracy was recorded. To test the custom implementation against the established implementation, Scikit-Learn’s RandomForestClassifier was implemented as well, using the same combination of hyperparameters. The same optimisation algorithm was used, with the same amount of trials, same datasets, and the same ranges, and the model was finally tested in the same manner to compare the accuracies. The custom implementation gives a slightly better accuracy for both validation and testing dataset, so that is the model that should be used by the backend, since the aim is to make the software as accurate as possible. To make the model useful, the software has to extract the 26 attributes from each website, using them to predict if it is phishing or not. Each characteristic of the URL has a separate function to determine it (1 for phishing, 0 for suspicious, and -1 for legitimate). For navigating to a URL, clicking links, retrieving web page contents, and loading dynamic content, we use a Selenium WebDriver object. The driver acts as an automated browser that allows the system to analyse web pages as they would appear to a real user, including executing JavaScript and rendering HTML, thereby enabling a more accurate assessment of their legitimacy.

- 'urgency_trust_spelling': This method analyses the text content of a website for urgency language, trust cues, and spelling errors, which are signs of a phishing attempt. First, a Selenium WebDriver was used to navigate to the URL, retrieving the source code, iterating over all tags, and appending spaces to ensure text separation and clean text extraction. The algorithm counts the keywords found in the website’s text, called the urgency and trust score. We defined a list of negation words as well ('not', 'don’t', 'never', 'no'), which are the most common negators in English that can invert or significantly alter the meaning of a word. For each occurrence of a keyword, the algorithm examines a window of 3 words surrounding it. If one of the negation words is found, the keyword is not considered anymore. To ensure the accuracy of this algorithm, we had to consider the total number of words as well, so we call the hyperparameter p, defined as: if number_of_words / urgency_trust_score < p, then the website is phishing. To tune it, we extracted 25 phishing email messages and 25 legitimate email messages from a personal inbox, which do not include sensitive information. Even though an email’s message can be easily included in a website, especially when it comes to marketing or informative emails, it is still not exactly the same thing, posing a potential threat to validity. We did not have access to websites that specifically use urgency language and trust cues, so this is why spam emails have been used for this task. We did an empirical analysis for tuning the hyperparameter, using the accuracy of the algorithm, which had to be maximised. The accuracy achieved was 84%, and the value of p is 320. On top of this, we use some different spelling error detection methods to comprehensively identify misspelled words in the text, and achieve a high accuracy, including SpellChecker, spaCy, TextBlob, and a dictionary file. Every checker returns a list of spelling errors. If the website has a spelling mistake, it should be found by all the checkers, and this is why in the end we intersect these lists, making the algorithm as accurate as possible.

- 'check_blacklists': The last phishing detection method checks whether the URL is found in any of the four public blacklists. The function orchestrates these checks by preparing the URL, removing spaces, removing the final slash if it exists, and considering both 'www' and non-'www' versions. It creates a list of functions using the four checks, so if an error occurs in one of them, the final result is not affected. If the URL is found in any blacklist, the website is considered phishing.

A crucial part of this project was assessing the effectiveness in identifying and mitigating phishing threats and analysing if the combination of different methods increases its efficiency of protecting the users. At the heart of the evaluation lies the analysis of the accuracy, precision, recall, and F1 Score of the software across a comprehensive array of phishing and legitimate scenarios. The results show a clear advantage of using the four methods combined, managing to outperform even well-established softwares.

### Challenges I ran into:
