// BACKUP DO VISUAL ANTIGO DAS EMPRESAS - PODE SER RESTAURADO SE NECESSÁRIO

// Código da linha 2335 em diante do App.js - Visual Antigo das Empresas:

return companiesWithDistance.map((company) => (
  <div key={company.id} className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl">
          <Store className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-800">{company.companyName}</h3>
          {/* Indicador de distância */}
          {company.distance !== null && (
            <div className="flex items-center space-x-1 mt-1">
              <MapPin className="h-3 w-3 text-blue-500" />
              <span className={`text-xs font-medium ${
                company.distance <= 1 ? 'text-green-600' :
                company.distance <= 5 ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {formatDistance(company.distance)} de você
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* Badge de proximidade */}
        {company.distance !== null && company.distance <= 1 && (
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
            📍 Muito Perto
          </div>
        )}
        <div className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm font-bold">{company.discount}</span>
        </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl flex items-start space-x-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <MapPin className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Endereço</label>
          <p className="text-gray-800 font-medium">{company.address}</p>
        </div>
      </div>
      
      // ... resto do código antigo
    </div>
  </div>
));