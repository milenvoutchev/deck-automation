import json2csv from 'json2csv';

// aka CsvExportService, someday should receive strategy, e.g. csv, txt, apkg
class ExportService {
  constructor(config) {
    this.fields = config.fields.split(',');
    this.format = 'csv';
    this.options = {
      hasCSVColumnTitle: false,
    };
  }

  getExported(collection = []) {
    return {
      format: this.format,
      content: this.getExportContent(collection),
    };
  }

  getExportContent(collection = []) {
    return json2csv({
      data: collection,
      fields: this.fields,
      hasCSVColumnTitle: this.options.hasCSVColumnTitle,
    });
  }
}

export default ExportService;
