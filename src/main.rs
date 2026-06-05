use anyhow::Context;
use axum::{Json, Router, routing::get};
use serde::Serialize;

const MILLION: f64 = 1_000_000.0;

#[derive(Serialize)]
pub enum Year {
    Y2024,
    Y2023,
    Y2022,
    Y2021,
    Y2020,
    Y2019,
    Y2018,
    Y2017,
    Y2016,
    Y2015,
}

impl From<usize> for Year {
    fn from(value: usize) -> Self {
        match value {
            2015 => Year::Y2015,
            2016 => Year::Y2016,
            2017 => Year::Y2017,
            2018 => Year::Y2018,
            2019 => Year::Y2019,
            2020 => Year::Y2020,
            2021 => Year::Y2021,
            2022 => Year::Y2022,
            2023 => Year::Y2023,
            2024=> Year::Y2024,
            _ => unreachable!(),
        }
    }
}

#[derive(Serialize)]
struct TenderingOpportunities {
    fiscal_year: Year,
    count: usize,
}

#[derive(Serialize)]
struct Expenditure {
    fiscal_year: Year,
    personal_income_tax: f64,
    corporation_income_tax: f64,
    domestic_vat: f64,
    imports_excise_duty: f64,
    imports_vat: f64,
}

#[derive(Serialize)]
struct Revenue {
    fiscal_year: Year,
    total_revenue: f64,
    domestic: f64,
}

async fn get_expenditure() -> Json<Vec<Expenditure>> {
    let data = [
        (2017.0, 3526.3, 15344.5, 356707.0, 3777.3, 25545.6),
        (2018.0, 3816.2, 29397.25, 319886.4, 4127.3, 24414.9),
        (2019.0, 4653.6, 22133.85, 257206.3, 4220.9, 22794.6),
        (2020.0, 4125.2, 23956.2, 234378.4, 5388.9, 17694.8),
        (2021.0, 1157.3, 5856.8, 211942.7, 537.3, 12008.7),
    ];

    let mut res = Vec::new();

    for (
        year,
        personal_income_tax,
        corporation_income_tax,
        domestic_vat,
        imports_excise_duty,
        imports_vat,
    ) in data
    {
        res.push(Expenditure {
            fiscal_year: (year as usize).into(),
            personal_income_tax: personal_income_tax * MILLION,
            corporation_income_tax: corporation_income_tax * MILLION,
            domestic_vat: domestic_vat * MILLION,
            imports_excise_duty: imports_excise_duty * MILLION,
            imports_vat: imports_vat * MILLION,
        })
    }

    Json(res)
}

async fn get_tendering() -> Json<Vec<TenderingOpportunities>> {
    let data = [
        (2015, 41),
        (2016, 177),
        (2017, 750),
        (2018, 11889),
        (2019, 11813),
        (2020, 26718),
        (2021, 25788),
        (2022, 48059),
        (2023, 54354),
    ];
    let mut res = Vec::new();
    for (year, count) in data {
        res.push(TenderingOpportunities {
            fiscal_year: year.into(),
            count,
        })
    }

    Json(res)
}

async fn get_revenue() -> Json<Vec<Revenue>> {
    let data = [(2024.0, 2.57, 1.688)];
    // TODO: I will add more data later on;

    let mut res = Vec::new();
    for (year, total_revenue, domestic) in data {
        res.push(Revenue {
            fiscal_year: (year as usize).into(),
            total_revenue: total_revenue * MILLION * MILLION,
            domestic: domestic * MILLION * MILLION,
        })
    }

    Json(res)
}

fn app() -> Router {
    Router::new()
        .route("/revenue", get(get_revenue))
        .route("/expenditure", get(get_expenditure))
        .route("/tendering", get(get_tendering))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let server_url = "127.0.0.1:9090";
    let listener = tokio::net::TcpListener::bind(server_url).await.unwrap();
    println!("Server Listening on {}", server_url);

    axum::serve(listener, app()).await.context("Serve App")?;

    Ok(())
}
