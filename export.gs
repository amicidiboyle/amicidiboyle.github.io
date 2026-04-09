function exportAdminFiles() {
  const folder = DriveApp.createFolder("Boyle_Admin_Export_" + Date.now());

  const adminHtml = HtmlService.createHtmlOutputFromFile("Admin").getContent();
  const code = getCodeFile_("Code");

  folder.createFile("Admin.html", adminHtml, MimeType.HTML);
  folder.createFile("Code.gs", code, MimeType.PLAIN_TEXT);

  return "Creato folder: " + folder.getUrl();
}

function getCodeFile_(name) {
  const files = DriveApp.getFilesByName(name + ".gs");
  if (files.hasNext()) {
    return files.next().getBlob().getDataAsString();
  }
  throw new Error("File " + name + ".gs non trovato");
}
