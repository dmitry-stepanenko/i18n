import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '@cosmos/config';

@Injectable({ providedIn: 'root' })
export class ArchivedPresentationCardMenuService {
  private readonly _apiUrl: string;

  constructor(
    private readonly _http: HttpClient,
    configService: ConfigService
  ) {
    this._apiUrl = configService.get<string>('smartlinkApiUrl');
  }

  downloadPdf(presentationId: number): void {
    window.open(`${this._apiUrl}/presentations/${presentationId}/pdf?dl=1`);
  }

  getArchivedPresentationProducts(presentationId: number) {
    return this._http.get<any[]>(
      `${this._apiUrl}/presentation/${presentationId}/products`
    );
  }
}
