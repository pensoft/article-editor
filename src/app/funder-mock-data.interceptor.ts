import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { EMPTY, Observable, of } from 'rxjs';
import { map } from 'lodash';
import { catchError } from 'rxjs/operators';

@Injectable()
export class FunderMockDataInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (
      request instanceof HttpRequest &&
      request.url === 'http://mock-data.com/'
    ) {
      const searchQuery = request.params.get('search');          

      if (typeof searchQuery == "string" && searchQuery.trim().length <= 3) {
        return of(new HttpResponse({ status: 200, body: '[]' }));
      } else if (typeof searchQuery == "string") {
        const filteredResults = funderSearchMockData.filter((data) =>
          data.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if(filteredResults.length > 5) {
          filteredResults.length = 5;
        }

        return of(
          new HttpResponse({
            status: 200,
            body: JSON.stringify(filteredResults),
          })
        );
      }
    }

    return next.handle(request).pipe(
      catchError(err => {
        return EMPTY
      }))
  }
}

const funderSearchMockData = [
  {
    first_author: 'Smith, J.',
    year: 2020,
    title: 'Machine Learning for Crop Disease Detection',
    source: 'IEEE Transactions on Geoscience and Remote Sensing',
  },
  {
    first_author: 'Garcia, M.',
    year: 2021,
    title: 'Automated Irrigation Systems Using Deep Learning',
    source: 'Journal of Agricultural Science and Technology',
  },
  {
    first_author: 'Lee, S.',
    year: 2022,
    title: 'Prediction of Crop Yield Using Random Forest Regression',
    source: 'Agricultural and Forest Meteorology',
  },
  {
    first_author: 'Miller, K.',
    year: 2020,
    title:
      'Spatial and Temporal Mapping of Soil Nutrients Using Machine Learning',
    source: 'Remote Sensing',
  },
  {
    first_author: 'Jones, A.',
    year: 2021,
    title:
      'Predicting Drought Stress in Maize Using Multispectral Remote Sensing',
    source: 'Journal of Applied Remote Sensing',
  },
  {
    first_author: 'Kim, H.',
    year: 2022,
    title:
      'Assessment of the Effects of Climate Change on Crop Yields Using Machine Learning Models',
    source: 'International Journal of Climatology',
  },
  {
    first_author: 'Chen, L.',
    year: 2020,
    title: 'Deep Learning for Leaf Disease Detection in Cotton',
    source: 'Computers and Electronics in Agriculture',
  },
  {
    first_author: 'Park, Y.',
    year: 2021,
    title:
      'Crop Monitoring and Yield Prediction Using Machine Learning Techniques',
    source: 'Sensors',
  },
  {
    first_author: 'Wang, Q.',
    year: 2022,
    title: 'Combining Multiple Data Sources for Improved Crop Yield Prediction',
    source: 'Agricultural Systems',
  },
  {
    first_author: 'Gonzalez, R.',
    year: 2020,
    title: 'Identification of Soybean Varieties Using Hyperspectral Imaging',
    source: 'Precision Agriculture',
  },
  {
    first_author: 'Huang, X.',
    year: 2021,
    title:
      'Estimation of Rice Yield Using UAV Images and Machine Learning Algorithms',
    source: 'Remote Sensing',
  },
  {
    first_author: 'Zhang, Y.',
    year: 2022,
    title:
      'Assessment of Crop Water Stress Using Machine Learning and Thermal Imaging',
    source: 'Journal of Irrigation and Drainage Engineering',
  },
  {
    first_author: 'Liu, X.',
    year: 2020,
    title: 'Identification of Citrus Fruit Varieties Using Spectral Imaging',
    source: 'Computers and Electronics in Agriculture',
  },
  {
    first_author: 'Li, J.',
    year: 2021,
    title: 'Prediction of Wheat Yield Using Machine Learning Algorithms',
    source: 'Frontiers in Plant Science',
  },
];
